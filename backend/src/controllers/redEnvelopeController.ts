import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { redEnvelopeSchema } from '../validation/redEnvelopeSchema'

const prisma = new PrismaClient()

export async function submitRedEnvelope(req: Request, res: Response, next: NextFunction) {
  const parsed = redEnvelopeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: parsed.error.errors[0]?.message ?? '輸入資料有誤',
      details: parsed.error.errors,
    })
    return
  }

  try {
    const record = await prisma.redEnvelopeEntry.create({ data: parsed.data })
    res.status(201).json({ data: record })
  } catch (err) {
    next(err)
  }
}
