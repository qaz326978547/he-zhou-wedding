import { z } from 'zod'

export const TABLE_COUNT = 17
/** 主桌內部桌號為 0，其餘為 1–16 */
export const MAIN_TABLE_NO = 0
export const MAX_TABLE_NO = TABLE_COUNT - 1
/** 每桌預設座位數 */
export const TABLE_CAPACITY = 10
/** 單桌加座後的上限 */
export const MAX_TABLE_CAPACITY = 12

const tableNo = z
  .number()
  .int('桌號格式錯誤')
  .min(MAIN_TABLE_NO, '桌號格式錯誤')
  .max(MAX_TABLE_NO, '桌號格式錯誤')

export const seatGuestSchema = z.object({
  tableNo,
  name: z.string().trim().min(1, '請輸入姓名').max(50, '姓名過長'),
  count: z
    .number()
    .int('人數須為整數')
    .min(1, '人數至少 1 位')
    .max(MAX_TABLE_CAPACITY, `人數最多 ${MAX_TABLE_CAPACITY} 位`),
  note: z
    .string()
    .trim()
    .max(100, '備註過長')
    .nullish()
    .transform((v) => (v ? v : null)),
  rsvpId: z.number().int().positive().nullish(),
})

// label / capacity 皆為選填；未傳入的欄位不更新
export const seatTableSchema = z.object({
  label: z.string().trim().max(20, '桌名過長').nullish(),
  capacity: z
    .number()
    .int('座位數須為整數')
    .min(1, '座位數至少 1 位')
    .max(MAX_TABLE_CAPACITY, `座位數最多 ${MAX_TABLE_CAPACITY} 位`)
    .optional(),
})

export const swapTablesSchema = z
  .object({ a: tableNo, b: tableNo })
  .refine((v) => v.a !== v.b, { message: '請選擇不同的兩桌' })

export type SeatGuestInput = z.infer<typeof seatGuestSchema>
