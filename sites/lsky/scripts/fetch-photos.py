# 从维基共享资源取 CC0 授权的优质照片（演示数据和首页示例图用）：python3 -I fetch-photos.py <输出目录>
# 搜索结果会随时间变化。W24 下载后去掉了与主题不符、带文字或品牌的几张，实际用到的照片见 photos.md
# 按主题搜索（结构化数据中授权为 CC0、属于 Quality images 分类），再按 extmetadata 中的授权二次核对；
# 下载 1920px 宽的版本（Wikimedia 的标准缩略图宽度，命中缓存），遇到 429 时退避重试，来源写入 <输出目录>/SOURCES.md 和 sources.json
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
API = "https://commons.wikimedia.org/w/api.php"
UA = "SparkStudioSiteShots/1.0 (product website screenshots)"
TOPICS = [
    "mountain lake", "alpine landscape", "waterfall", "forest", "beach sunset", "desert dunes", "snow landscape",
    "autumn leaves", "flower macro", "bird", "cat", "dog", "fox", "butterfly", "city skyline night", "bridge",
    "lighthouse", "old town street", "cafe coffee", "food dish", "fruit", "train", "sailing boat", "aurora",
]
PER_TOPIC = 2
# 只收 CC0（公有领域的多是翻拍的老画作）；排除博物馆中的翻拍
SKIP = re.compile(r"mus[ée]e|museum|painting|gem[äa]lde", re.I)


def fetch(url):
    for attempt in range(6):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 5:
                raise
            time.sleep(15 * (attempt + 1))


def get(params):
    return json.loads(fetch(API + "?" + urllib.parse.urlencode({**params, "format": "json"})))


def strip(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html or "")).strip()


sources = []
seen = set()
for topic in TOPICS:
    q = f'haswbstatement:P275=Q6938433 incategory:Quality_images filetype:bitmap {topic}'
    res = get({"action": "query", "list": "search", "srnamespace": 6, "srlimit": 12, "srsearch": q})
    titles = [s["title"] for s in res["query"]["search"] if s["title"] not in seen]
    if not titles:
        continue
    info = get({
        "action": "query", "prop": "imageinfo", "titles": "|".join(titles),
        "iiprop": "url|size|extmetadata|mime", "iiurlwidth": 1920,
    })
    got = 0
    for page in info["query"]["pages"].values():
        if got >= PER_TOPIC:
            break
        ii = (page.get("imageinfo") or [{}])[0]
        meta = ii.get("extmetadata", {})
        lic = strip(meta.get("LicenseShortName", {}).get("value", ""))
        if lic != "CC0" or SKIP.search(page["title"]) or ii.get("mime") != "image/jpeg":
            continue
        if ii.get("width", 0) < 2000 or ii.get("width", 0) < ii.get("height", 0) * 0.6:
            continue
        title = page["title"]
        seen.add(title)
        name = f"{len(sources) + 1:02d}-{re.sub(r'[^a-z0-9]+', '-', topic)}.jpg"
        with open(os.path.join(OUT, name), "wb") as f:
            f.write(fetch(ii["thumburl"]))
        sources.append({
            "file": name, "title": title, "topic": topic, "license": lic,
            "artist": strip(meta.get("Artist", {}).get("value", "")),
            "url": ii.get("descriptionurl"), "width": ii["width"], "height": ii["height"],
        })
        got += 1
        print("✓", name, lic, title)
        time.sleep(3)

with open(os.path.join(OUT, "sources.json"), "w") as f:
    json.dump(sources, f, ensure_ascii=False, indent=2)
with open(os.path.join(OUT, "SOURCES.md"), "w") as f:
    f.write("# 照片来源\n\n均取自维基共享资源（Wikimedia Commons），授权均为 CC0，下载的是 1920px 宽的缩略图。\n\n")
    f.write("| 文件 | 原文件 | 作者 | 授权 |\n|---|---|---|---|\n")
    for s in sources:
        f.write(f"| {s['file']} | [{s['title']}]({s['url']}) | {s['artist']} | {s['license']} |\n")
print(len(sources), "张")
