import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { adminCreateRsvpSchema, adminRsvpSchema } from '../validation/adminRsvpSchema'

const prisma = new PrismaClient()

export async function loginAdmin(req: Request, res: Response) {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤' })
  }
  const credentials = JSON.parse(process.env.ADMIN_CREDENTIALS!)
  if (credentials[username] !== password) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤' })
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '24h' })
  return res.json({ data: { token, username } })
}

export async function listRsvp(_req: Request, res: Response) {
  const list = await prisma.rSVPSubmission.findMany({ orderBy: { createdAt: 'desc' } })
  return res.json({ data: list })
}

export async function createRsvp(req: Request, res: Response) {
  const result = adminCreateRsvpSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', details: result.error.errors })
  }
  try {
    const record = await prisma.rSVPSubmission.create({ data: { attending: true, ...result.data } })
    return res.status(201).json({ data: record })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'DUPLICATE_PHONE', message: '此電話號碼已登記' })
    }
    throw err
  }
}

export async function updateRsvp(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) return res.status(400).json({ error: 'INVALID_ID' })
  const result = adminRsvpSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', details: result.error.errors })
  }
  try {
    const record = await prisma.rSVPSubmission.update({ where: { id }, data: result.data })
    return res.json({ data: record })
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'NOT_FOUND', message: '找不到此 RSVP' })
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'DUPLICATE_PHONE', message: '此電話號碼已登記' })
    }
    throw err
  }
}

export async function deleteRsvp(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) return res.status(400).json({ error: 'INVALID_ID' })
  try {
    await prisma.rSVPSubmission.delete({ where: { id } })
    return res.status(204).send()
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'NOT_FOUND', message: '找不到此 RSVP' })
    }
    throw err
  }
}
