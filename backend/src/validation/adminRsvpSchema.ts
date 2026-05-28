import { z } from 'zod'

const TAIWAN_PHONE = /^09\d{8}$|^0[2-9]\d{7,8}$/

const DIETARY = z.enum(['regular', 'vegetarian'])
const SIDE = z.enum(['groom', 'bride'])
const REL_TYPE = z.enum(['relative', 'friend'])

const relationshipRefinement = (d: { relationshipType?: string; relationshipSide?: string }) =>
  !(d.relationshipType && !d.relationshipSide)

// Admin create schema: name/phone required, guest counts optional/nullable
export const adminCreateRsvpSchema = z
  .object({
    name: z.string().min(1, '請填寫姓名'),
    phone: z.string().regex(TAIWAN_PHONE, '請輸入台灣手機（09 開頭）或市話格式'),
    adultCount: z.number().int().min(1).max(10).nullable().optional(),
    childCount: z.number().int().min(0).max(10).nullable().optional(),
    needsHighchair: z.boolean().nullable().optional(),
    highchairCount: z.number().int().min(1).max(10).nullable().optional(),
    relationshipSide: SIDE.optional(),
    relationshipType: REL_TYPE.optional(),
    dietaryPreference: DIETARY.default('regular'),
    needsInvitation: z.boolean().default(false),
    invitationName: z.string().optional(),
    invitationPhone: z.string().optional(),
    invitationAddress: z.string().optional(),
  })
  .refine(relationshipRefinement, { message: '選擇關係類型前必須先選擇賓桌歸屬', path: ['relationshipType'] })

export type AdminCreateRsvpInput = z.infer<typeof adminCreateRsvpSchema>

// Admin update schema: all fields optional
export const adminRsvpSchema = z
  .object({
    name: z.string().min(1, '請填寫姓名').optional(),
    phone: z.string().regex(TAIWAN_PHONE, '請輸入台灣手機（09 開頭）或市話格式').optional(),
    attending: z.boolean().optional(),
    adultCount: z.number().int().min(1).max(10).nullable().optional(),
    childCount: z.number().int().min(0).max(10).nullable().optional(),
    needsHighchair: z.boolean().nullable().optional(),
    highchairCount: z.number().int().min(1).max(10).nullable().optional(),
    relationshipSide: SIDE.optional(),
    relationshipType: REL_TYPE.optional(),
    dietaryPreference: DIETARY.optional(),
    needsInvitation: z.boolean().optional(),
    invitationName: z.string().optional(),
    invitationPhone: z.string().optional(),
    invitationAddress: z.string().optional(),
  })
  .refine(relationshipRefinement, { message: '選擇關係類型前必須先選擇賓桌歸屬', path: ['relationshipType'] })

export type AdminRsvpInput = z.infer<typeof adminRsvpSchema>
