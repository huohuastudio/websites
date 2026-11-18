// 截图脚本（screenshots.mjs）和录屏脚本（recordings.mjs）共用：连接哪个 Keepbay、登录、按接口查文件夹。
// 环境变量：KEEPBAY_DEMO_URL（默认 https://demo.keepbay.app）、KEEPBAY_DEMO_USER、KEEPBAY_DEMO_PASSWORD（默认演示帐号）
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const site = join(dirname(fileURLToPath(import.meta.url)), '..')
export const demo = 'https://demo.keepbay.app'
export const base = process.env.KEEPBAY_DEMO_URL ?? demo
export const onDemo = new URL(base).origin === demo
// 演示帐号（公开写在演示站的登录页上）
const account = {
  username: process.env.KEEPBAY_DEMO_USER ?? 'demo',
  password: process.env.KEEPBAY_DEMO_PASSWORD ?? 'keepbay-demo',
}

/**
 * 新建登录好的浏览器上下文。view：文件夹的视图（Keepbay 存在浏览器本地，键为 keepbay.views.<用户 ID>）。
 * 演示帐号是共用的，访客可能存了固定的浅色或深色：读偏好时去掉外观设置，按 colorScheme 显示（不改帐号上存的）
 */
export async function newContext(browser, { viewport, scale, scheme, view }) {
  const context = await browser.newContext({
    baseURL: base,
    viewport,
    deviceScaleFactor: scale,
    colorScheme: scheme,
    locale: 'zh-CN',
  })
  try {
    const login = await context.request.post('/api/v1/auth/login', { headers: { 'X-Keepbay-Request': '1' }, data: account })
    if (!login.ok()) throw new Error(`登录失败：${login.status()}`)
    if (view) {
      const me = await (await context.request.get('/api/v1/auth/me')).json()
      await context.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [`keepbay.views.${me.id}`, JSON.stringify({ base: view, folders: [] })],
      )
    }
    await context.route('**/api/v1/me/prefs', async (route) => {
      if (route.request().method() !== 'GET') return route.continue()
      const response = await route.fetch()
      const prefs = await response.json()
      delete prefs.appearance
      await route.fulfill({ response, json: prefs })
    })
    return context
  } catch (error) {
    await context.close()
    throw error
  }
}

/** 按名称找到挂载的文件夹（接口返回的 path 是它在服务器磁盘上的位置）。 */
export async function mount(request, name) {
  const mounts = await (await request.get('/api/v1/mounts')).json()
  const found = mounts.find((m) => m.name === name)
  if (!found) throw new Error(`没有文件夹 ${name}`)
  return found
}

/** 文件夹 id 中的各项。 */
export async function folderItems(request, id) {
  return (await (await request.get(`/api/v1/folders/${id}/items`)).json()).items
}

/** 按名称路径找到文件夹的 ID。 */
export async function folderId(request, names) {
  let id = (await mount(request, names[0])).rootFolder
  for (const name of names.slice(1)) {
    const items = await folderItems(request, id)
    const item = items.find((it) => it.dir && it.name === name)
    if (!item) throw new Error(`没有文件夹 ${names.join('/')}`)
    id = item.id
  }
  return id
}

/** 打开页面，等到界面按 scheme 显示、图片都加载完。缩略图加载失败时 Keepbay 换成文件类型图标，页面上看不出来，要从请求判断 */
export async function open(page, path, scheme) {
  const failed = []
  page.on('response', (r) => {
    if (r.url().includes('/thumb') && !r.ok()) failed.push(r.url())
  })
  page.on('requestfailed', (r) => {
    if (r.url().includes('/thumb')) failed.push(r.url())
  })
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.waitForFunction((theme) => document.documentElement.dataset.theme === theme, scheme)
  await imagesLoaded(page)
  if (failed.length) throw new Error(`${failed.length} 张缩略图没有加载：${failed[0]}`)
}

/** 等页面上的图片都加载完。 */
export function imagesLoaded(page) {
  return page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0))
}
