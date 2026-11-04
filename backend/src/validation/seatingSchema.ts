import { z } from 'zod'

export const TABLE_COUNT = 17
export const TABLE_CAPACITY = 10

const tableNo = z
  .number()
  .int('桌號格式錯誤')
  .min(1, '桌號格式錯誤')
  .max(TABLE_COUNT, '桌號格式錯誤')

export const seatGuestSchema = z.object({
  tableNo,
  name: z.string().trim().min(1, '請輸入姓名').max(50, '姓名過長'),
  count: z
    .number()
    .int('人數須為整數')
    .min(1, '人數至少 1 位')
    .max(TABLE_CAPACITY, `人數最多 ${TABLE_CAPACITY} 位`),
  note: z
    .string()
    .trim()
    .max(100, '備註過長')
    .nullish()
    .transform((v) => (v ? v : null)),
  rsvpId: z.number().int().positive().nullish(),
})

export const seatTableLabelSchema = z.object({
  label: z
    .string()
    .trim()
    .max(20, '桌名過長')
    .nullish()
    .transform((v) => (v ? v : null)),
})

export type SeatGuestInput = z.infer<typeof seatGuestSchema>
