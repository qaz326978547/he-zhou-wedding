import { z } from 'zod'

const TAIWAN_PHONE = /^09\d{8}$|^0[2-9]\d{7,8}$/

const DIETARY = z.enum(['regular', 'vegetarian'])
const SIDE = z.enum(['groom', 'bride'])
const REL_TYPE = z.enum(['relative', 'friend'])

export const rsvpSchema = z
  .object({
    name: z.string().min(1, '請填寫姓名'),
    phone: z.string().regex(TAIWAN_PHONE, '請輸入台灣手機（09 開頭）或市話格式'),
    attending: z.boolean(),
    adultCount: z.number().int().min(1).max(10).nullable().optional(),
    childCount: z.number().int().min(0).max(10).nullable().optional(),
    needsHighchair: z.boolean().nullable().optional(),
    highchairCount: z.number().int().min(1).max(10).nullable().optional(),
    relationshipSide: SIDE.optional(),
    relationshipType: REL_TYPE.optional(),
    dietaryPreference: DIETARY.default('regular'),
    needsInvitation: z.boolean().default(false),
    invitationName: z.string().min(1).optional(),
    invitationPhone: z.string().optional(),
    invitationAddress: z.string().min(1).optional(),
  })
  .refine(
    (d) => {
      if (!d.attending) return true
      return d.adultCount !== undefined && d.adultCount !== null && d.adultCount >= 1 && d.adultCount <= 10
    },
    { message: '出席時請填寫大人人數（1–10）', path: ['adultCount'] },
  )
  .refine(
    (d) => {
      if (!d.attending) return true
      return d.childCount !== undefined && d.childCount !== null && d.childCount >= 0 && d.childCount <= 10
    },
    { message: '小孩人數請填寫 0–10', path: ['childCount'] },
  )
  .refine(
    (d) => {
      if (!d.attending) return true
      if (!d.childCount) return true
      return d.needsHighchair !== undefined && d.needsHighchair !== null
    },
    { message: '請選擇是否需要兒童椅', path: ['needsHighchair'] },
  )
  .refine(
    (d) => {
      if (d.needsHighchair !== true) return true
      if (!d.childCount || !d.highchairCount) return true
      return d.highchairCount <= d.childCount
    },
    { message: '兒童椅張數不能超過小孩人數', path: ['highchairCount'] },
  )
  .refine(
    (d) => !(d.relationshipType && !d.relationshipSide),
    { message: '選擇關係類型前必須先選擇賓桌歸屬', path: ['relationshipType'] },
  )
  .refine(
    (d) => !d.needsInvitation || !!d.invitationName?.trim(),
    { message: '請填寫收件人姓名', path: ['invitationName'] },
  )
  .refine(
    (d) => !d.needsInvitation || (!!d.invitationPhone?.trim() && TAIWAN_PHONE.test(d.invitationPhone.trim())),
    { message: '請填寫有效的收件人電話', path: ['invitationPhone'] },
  )
  .refine(
    (d) => !d.needsInvitation || !!d.invitationAddress?.trim(),
    { message: '請填寫收件地址', path: ['invitationAddress'] },
  )

export type RsvpInput = z.infer<typeof rsvpSchema>
