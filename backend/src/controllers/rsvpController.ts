import { Request, Response, NextFunction } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { rsvpSchema } from '../validation/rsvpSchema'
import { sendAdminNotification } from '../services/emailService'

const prisma = new PrismaClient()

export async function submitRsvp(req: Request, res: Response, next: NextFunction) {
  if (process.env.RSVP_ENABLED === 'false') {
    res.status(422).json({ error: 'RSVP_DISABLED', message: '報名已截止' })
    return
  }

  const parsed = rsvpSchema.safeParse(req.body)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    parsed.error.errors.forEach((e) => {
      const key = e.path[0]?.toString() ?? 'general'
      fields[key] = e.message
    })
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: parsed.error.errors[0]?.message ?? '輸入資料有誤',
      fields,
    })
    return
  }

  try {
    const record = await prisma.rSVPSubmission.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        attending: parsed.data.attending,
        adultCount: parsed.data.attending ? (parsed.data.adultCount ?? null) : null,
        childCount: parsed.data.attending ? (parsed.data.childCount ?? null) : null,
        needsHighchair: parsed.data.attending && parsed.data.childCount ? (parsed.data.needsHighchair ?? null) : null,
        relationshipSide: parsed.data.relationshipSide ?? null,
        relationshipType: parsed.data.relationshipType ?? null,
        dietaryPreference: parsed.data.dietaryPreference ?? 'regular',
        needsInvitation: parsed.data.needsInvitation ?? false,
        invitationName: parsed.data.needsInvitation ? (parsed.data.invitationName ?? null) : null,
        invitationPhone: parsed.data.needsInvitation ? (parsed.data.invitationPhone ?? null) : null,
        invitationAddress: parsed.data.needsInvitation ? (parsed.data.invitationAddress ?? null) : null,
      },
    })

    res.status(201).json({ data: { id: record.id, message: 'RSVP 已成功提交' } })

    // Fire-and-forget email notification
    sendAdminNotification(record.id, parsed.data, record.createdAt).catch(() => {})
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      res.status(409).json({ error: 'DUPLICATE_PHONE', message: '已收到您的回覆，感謝您！' })
      return
    }
    next(err)
  }
}

export function getRsvpStatus(_req: Request, res: Response) {
  const enabled = process.env.RSVP_ENABLED !== 'false'
  res.json({ data: { enabled } })
}

export function healthCheck(_req: Request, res: Response) {
  res.json({ data: { status: 'ok' } })
}
