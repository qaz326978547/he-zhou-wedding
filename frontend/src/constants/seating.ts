// 草悟廳 Banquet Hall 座位配置
// 座標沿用場地平面圖像素座標（SVG viewBox 直接使用），每桌 10 人、共 17 桌（主桌 + 1–16 桌）。
// 編號：主桌（舞台正前方）不編號，內部以 0 表示；
// 其餘由最左側一欄開始，每欄由上往下編號，再往右一欄。

/** 每桌預設座位數 */
export const TABLE_CAPACITY = 10
/** 單桌加座後的上限 */
export const MAX_TABLE_CAPACITY = 12
export const TABLE_RADIUS = 45
export const MAIN_TABLE_NO = 0

export interface TableLayout {
  no: number
  x: number
  y: number
}

export const TABLE_LAYOUT: TableLayout[] = [
  // 主桌
  { no: MAIN_TABLE_NO, x: 803, y: 545 },
  // 第一欄（最左）
  { no: 1, x: 459, y: 688 },
  { no: 2, x: 462, y: 820 },
  { no: 3, x: 462, y: 1004 },
  { no: 4, x: 461, y: 1145 },
  // 第二欄
  { no: 5, x: 597, y: 890 },
  // 第三欄
  { no: 6, x: 735, y: 684 },
  { no: 7, x: 733, y: 840 },
  { no: 8, x: 733, y: 997 },
  // 第四欄
  { no: 9, x: 866, y: 684 },
  { no: 10, x: 864, y: 840 },
  { no: 11, x: 864, y: 997 },
  // 第五欄
  { no: 12, x: 1014, y: 876 },
  // 第六欄（最右）
  { no: 13, x: 1155, y: 600 },
  { no: 14, x: 1154, y: 731 },
  { no: 15, x: 1152, y: 896 },
  { no: 16, x: 1154, y: 1049 },
]

export const TABLE_COUNT = TABLE_LAYOUT.length

/** 桌位基本名稱：主桌顯示「主桌」，其餘顯示「第 N 桌」 */
export function baseTableName(no: number) {
  return no === MAIN_TABLE_NO ? '主桌' : `第 ${no} 桌`
}

/** 柱子位置 */
export const PILLARS = [
  { x: 607, y: 757 },
  { x: 1019, y: 757 },
  { x: 607, y: 1049 },
  { x: 1019, y: 1049 },
]

export const FLOOR_VIEWBOX = '370 200 930 1310'
