import { z } from 'zod'

const TAIWAN_PHONE = /^09\d{8}$|^0[2-9]\d{7,8}$/

const DIETARY = z.enum(['regular', 'vegetarian', 'no_beef', 'no_pork', 'other'])
const SIDE = z.enum(['groom', 'bride'])
const REL_TYPE = z.enum(['relative', 'friend'])

const guestCountRefinement = (d: { guestCount?: number | null; relationshipSide?: string; relationshipType?: string }) => {
  if (d.guestCount === undefined || d.guestCount === null) return true
  return d.guestCount >= 0 && d.guestCount <= 10
}

const relationshipRefinement = (d: { relationshipType?: string; relationshipSide?: string }) =>
  !(d.relationshipType && !d.relationshipSide)

// Admin create schema: name/phone required, guestCount nullable
export const adminCreateRsvpSchema = z
  .object({
    name: z.string().min(1, '請填寫姓名'),
    phone: z.string().regex(TAIWAN_PHONE, '請輸入台灣手機（09 開頭）或市話格式'),
    guestCount: z.number().int().nullable().optional(),
    relationshipSide: SIDE.optional(),
    relationshipType: REL_TYPE.optional(),
    dietaryPreference: DIETARY.default('regular'),
    notes: z.string().max(300, '備註最多 300 字元').optional(),
  })
  .refine(guestCountRefinement, { message: '出席人數範圍無效（0–10，或留空表示待確認）', path: ['guestCount'] })
  .refine(relationshipRefinement, { message: '選擇關係類型前必須先選擇賓桌歸屬', path: ['relationshipType'] })

export type AdminCreateRsvpInput = z.infer<typeof adminCreateRsvpSchema>

// Admin update schema: all fields optional, guestCount nullable
export const adminRsvpSchema = z
  .object({
    name: z.string().min(1, '請填寫姓名').optional(),
    phone: z.string().regex(TAIWAN_PHONE, '請輸入台灣手機（09 開頭）或市話格式').optional(),
    attending: z.boolean().optional(),
    guestCount: z.number().int().nullable().optional(),
    relationshipSide: SIDE.optional(),
    relationshipType: REL_TYPE.optional(),
    dietaryPreference: DIETARY.optional(),
    notes: z.string().max(300, '備註最多 300 字元').optional(),
  })
  .refine(guestCountRefinement, { message: '出席人數範圍無效（0–10，或留空表示待確認）', path: ['guestCount'] })
  .refine(relationshipRefinement, { message: '選擇關係類型前必須先選擇賓桌歸屬', path: ['relationshipType'] })

export type AdminRsvpInput = z.infer<typeof adminRsvpSchema>
