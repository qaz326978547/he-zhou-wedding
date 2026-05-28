import { z } from 'zod'

const TAIWAN_PHONE = /^09\d{8}$|^0[2-9]\d{7,8}$/

const DIETARY = z.enum(['regular', 'vegetarian', 'no_beef', 'no_pork', 'other'])
const SIDE = z.enum(['groom', 'bride'])
const REL_TYPE = z.enum(['relative', 'friend'])

export const adminRsvpSchema = z
  .object({
    name: z.string().min(1, '請填寫姓名').optional(),
    phone: z.string().regex(TAIWAN_PHONE, '請輸入台灣手機（09 開頭）或市話格式').optional(),
    attending: z.boolean().optional(),
    guestCount: z.number().int().optional(),
    relationshipSide: SIDE.optional(),
    relationshipType: REL_TYPE.optional(),
    dietaryPreference: DIETARY.optional(),
    notes: z.string().max(300, '備註最多 300 字元').optional(),
  })
  .refine(
    (d) => {
      if (d.attending === undefined || d.guestCount === undefined) return true
      if (d.attending) return d.guestCount >= 1 && d.guestCount <= 10
      return d.guestCount === 0
    },
    { message: '出席人數範圍無效（出席時 1–10，不克出席時為 0）', path: ['guestCount'] },
  )
  .refine(
    (d) => !(d.relationshipType && !d.relationshipSide),
    { message: '選擇關係類型前必須先選擇賓桌歸屬', path: ['relationshipType'] },
  )

export type AdminRsvpInput = z.infer<typeof adminRsvpSchema>
