// 草悟廳 Banquet Hall 座位配置
// 座標沿用場地平面圖像素座標（SVG viewBox 直接使用），每桌 10 人、共 17 桌。
// 編號：由舞台往入口、同排由左至右。

export const TABLE_CAPACITY = 10
export const TABLE_RADIUS = 45

export interface TableLayout {
  no: number
  x: number
  y: number
}

export const TABLE_LAYOUT: TableLayout[] = [
  // 舞台正前方
  { no: 1, x: 803, y: 545 },
  { no: 2, x: 1155, y: 600 },
  // 第二排
  { no: 3, x: 459, y: 688 },
  { no: 4, x: 735, y: 684 },
  { no: 5, x: 866, y: 684 },
  { no: 6, x: 1154, y: 731 },
  // 第三排
  { no: 7, x: 462, y: 820 },
  { no: 8, x: 597, y: 890 },
  { no: 9, x: 733, y: 840 },
  { no: 10, x: 864, y: 840 },
  { no: 11, x: 1014, y: 876 },
  { no: 12, x: 1152, y: 896 },
  // 第四排
  { no: 13, x: 462, y: 1004 },
  { no: 14, x: 733, y: 997 },
  { no: 15, x: 864, y: 997 },
  { no: 16, x: 1154, y: 1049 },
  // 最後一排
  { no: 17, x: 461, y: 1145 },
]

export const TABLE_COUNT = TABLE_LAYOUT.length

/** 柱子位置 */
export const PILLARS = [
  { x: 607, y: 757 },
  { x: 1019, y: 757 },
  { x: 607, y: 1049 },
  { x: 1019, y: 1049 },
]

export const FLOOR_VIEWBOX = '370 200 930 1310'
