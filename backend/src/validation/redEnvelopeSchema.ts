import { z } from 'zod'

export const redEnvelopeSchema = z.object({
  name: z.string().trim().min(1, '請輸入姓名').max(50, '姓名過長'),
  amount: z.number().int('金額須為正整數').positive('金額須為正整數'),
})

export type RedEnvelopeInput = z.infer<typeof redEnvelopeSchema>
