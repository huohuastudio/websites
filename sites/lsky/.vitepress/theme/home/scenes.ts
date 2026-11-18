// 首页示意图的数据：没有可用的照片素材，用 SVG 画几何风景（由 LsScene 绘制）

export interface Scene {
  /** mount：山和湖；sea：海和小岛 */
  kind: 'mount' | 'sea'
  sky: string
  sun: string
  /** 太阳的位置（viewBox 为 400 × 300） */
  sx: number
  sy: number
  far: string
  near: string
  water: string
  clouds?: boolean
}

export const scenes = {
  lake: { kind: 'mount', sky: '#b9d6ee', sun: '#f4c45a', sx: 300, sy: 78, far: '#9bb8cf', near: '#5f87a6', water: '#a8cde2' },
  sea: { kind: 'sea', sky: '#f6d9b8', sun: '#ee8f5a', sx: 140, sy: 150, far: '#4d6a86', near: '#35506a', water: '#6d8fb5' },
  dusk: { kind: 'sea', sky: '#e7c3a3', sun: '#e98a63', sx: 110, sy: 160, far: '#58708a', near: '#3d566e', water: '#7891ae' },
  blue: { kind: 'sea', sky: '#9fcbef', sun: '#fff4c9', sx: 330, sy: 60, far: '#58708a', near: '#3d566e', water: '#5f8fc0', clouds: true },
} satisfies Record<string, Scene>

/** 上传卡片和审核墙用的小图配色，按序号取，保证每次一样 */
const palette = [
  ['#cfe2f0', '#9bb8cf', '#5f87a6', '#a8cde2'],
  ['#f3dcc0', '#c9a27e', '#8a6a52', '#d9b896'],
  ['#dfe9d6', '#9fbf8f', '#5d8a5a', '#b9d3c2'],
  ['#e5dcef', '#ae9cc9', '#76649a', '#c7bde0'],
  ['#f6d9b8', '#4d6a86', '#35506a', '#6d8fb5'],
  ['#d8e4e8', '#8aa5ad', '#557079', '#b4c9cf'],
]

/** 第 i 张小图的风景 */
export function miniScene(i: number): Scene {
  const [sky, far, near, water] = palette[i % palette.length]
  return {
    kind: i % 3 === 2 ? 'sea' : 'mount',
    sky,
    sun: i % 2 ? '#f4c45a' : '#fff1c4',
    sx: 80 + ((i * 67) % 240),
    sy: 70 + ((i * 29) % 60),
    far,
    near,
    water,
  }
}
