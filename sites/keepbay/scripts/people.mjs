// 首页「人物、宠物和地点」一节（KbPeople.vue）用的照片：登录演示站，取起了名的人物和宠物，每个取两张照片（脸最大的一张作封面），
// 照片缩小后存到 public/people/<文件 ID>.webp，封面上的脸另裁一张头像存为 public/people/face-<人物 ID>.webp（从原图裁，头像比照片中的脸清晰），
// 照片尺寸、人脸框、头像在照片中的位置写进 .vitepress/theme/people.json。
// 演示站的人物、宠物或照片变了以后重新运行。在本机运行，不进 Cloudflare 的构建。
//
// 用法：pnpm --filter ./sites/keepbay people
// 需要：ImageMagick（brew install imagemagick，带 WebP）。环境变量见 keepbay.mjs
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { request as api } from 'playwright'
import { base, login, site } from './keepbay.mjs'

const out = join(site, 'public/people')
const manifestFile = join(site, '.vitepress/theme/people.json')

// 首页上的顺序：人物在前、宠物在后，各自按演示站上的照片张数排列；没起名的人物不用
const perKind = { person: 5, pet: 2 }
// 每个人物、宠物取几张照片
const perSubject = 2
// 照片缩小后的长边（首页上一张照片最宽约 300px，2 倍屏要 600 像素），头像的边长（首页上最大约 112px）
const photoSize = 800
const faceSize = 256
// 头像比人脸框大多少：人脸框只框住五官，留出头发和下巴；宠物的框框住全身，只留一点边
const pad = { person: 1.7, pet: 1.08 }

const request = await api.newContext({ baseURL: base })
try {
  await login(request)
  const get = async (path) => {
    const res = await request.get(path)
    if (!res.ok()) throw new Error(`${path}：${res.status()}`)
    return res
  }
  const { people } = await (await get('/api/v1/people')).json()
  const subjects = Object.entries(perKind).flatMap(([kind, n]) => {
    const named = people.filter((p) => p.kind === kind && p.name && !p.hidden).sort((a, b) => b.count - a.count)
    if (named.length < n) throw new Error(`演示站上起了名的${kind === 'pet' ? '宠物' : '人物'}不到 ${n} 个`)
    return named.slice(0, n)
  })

  // 先选好全部照片再动旧素材：哪个人物的照片不够时报错退出，首页仍是上一次生成的
  // 一张照片只用一次（合影中有两个人时只算前一个人的）
  const used = new Set()
  const picks = []
  for (const subject of subjects) {
    const { items, boxes } = await (await get(`/api/v1/people/${subject.id}`)).json()
    // 按脸在原图中的像素大小排列，大的在前
    const ranked = items
      .map((photo, i) => ({ photo, box: boxes[i], px: Math.max(boxes[i].w * photo.width, boxes[i].h * photo.height) }))
      .filter((c) => !used.has(c.photo.id))
      .sort((a, b) => b.px - a.px)
      .slice(0, perSubject)
    if (ranked.length < perSubject) throw new Error(`${subject.name} 的照片不到 ${perSubject} 张`)
    for (const { photo } of ranked) used.add(photo.id)
    picks.push({ subject, ranked })
  }

  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  const manifest = []
  for (const { subject, ranked } of picks) {
    const photos = []
    for (const [i, { photo, box }] of ranked.entries()) {
      const original = Buffer.from(await (await get(`/api/v1/files/${photo.id}/preview/full`)).body())
      // 宽高按转正后的方向读（人脸框也是按转正后的照片给的），在缩小前打印出来，免得为取宽高再解码一次
      const [width, height] = webp(original, ['-print', '%w %h', '-resize', `${photoSize}x${photoSize}`, '-quality', '78'], `${photo.id}.webp`)
        .toString()
        .split(' ')
        .map(Number)
      // 头像的范围：以人脸框的中心为中心的正方形，放大 pad 倍，不超出照片；按照片宽、高的比例记下，首页按它把照片收拢成头像。
      // 每张照片都记，只有封面裁出头像图
      const side = Math.min(Math.max(box.w * width, box.h * height) * pad[subject.kind], width, height)
      const x = Math.min(Math.max((box.x + box.w / 2) * width - side / 2, 0), width - side)
      const y = Math.min(Math.max((box.y + box.h / 2) * height - side / 2, 0), height - side)
      const entry = {
        id: photo.id,
        aspect: round(width / height),
        box: [box.x, box.y, box.w, box.h].map(round),
        face: [x / width, y / height, side / width, side / height].map(round),
      }
      if (i === 0) {
        const crop = `${Math.round(side)}x${Math.round(side)}+${Math.round(x)}+${Math.round(y)}`
        webp(original, ['-crop', crop, '+repage', '-resize', `${faceSize}x${faceSize}`, '-quality', '82'], `face-${subject.id}.webp`)
      }
      photos.push(entry)
    }
    manifest.push({ id: subject.id, kind: subject.kind, name: subject.name, count: subject.count, photos })
    console.log(`${subject.name}：${photos.map((p) => p.id).join('、')}`)
  }
  // 一个人物或宠物一行
  writeFileSync(manifestFile, `[\n${manifest.map((m) => `  ${JSON.stringify(m)}`).join(',\n')}\n]\n`)
} finally {
  await request.dispose()
}

/** 转成 WebP 存到 out 中，返回 magick 的标准输出（-print 打印的内容） */
function webp(input, args, name) {
  return execFileSync('magick', ['-', '-auto-orient', ...args, '-strip', join(out, name)], { input })
}

function round(v) {
  return Math.round(v * 1e4) / 1e4
}
