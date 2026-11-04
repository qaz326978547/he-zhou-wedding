import { Request, Response, NextFunction, RequestHandler } from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
  TABLE_CAPACITY,
  TABLE_COUNT,
  MAIN_TABLE_NO,
  MAX_TABLE_NO,
  seatGuestSchema,
  seatTableLabelSchema,
} from '../validation/seatingSchema'

const prisma = new PrismaClient()

class TableFullError extends Error {
  constructor(public tableNo: number, public remaining: number) {
    super(`${tableNo === MAIN_TABLE_NO ? '主桌' : `第 ${tableNo} 桌`}座位不足，剩餘 ${remaining} 位`)
  }
}

/** 計算某桌（排除指定紀錄）已入座人數，超過容量時丟出 TableFullError */
async function assertCapacity(
  tx: Prisma.TransactionClient,
  tableNo: number,
  count: number,
  excludeId?: number,
) {
  const agg = await tx.seatGuest.aggregate({
    _sum: { count: true },
    where: { tableNo, ...(excludeId ? { id: { not: excludeId } } : {}) },
  })
  const used = agg._sum.count ?? 0
  if (used + count > TABLE_CAPACITY) {
    throw new TableFullError(tableNo, Math.max(TABLE_CAPACITY - used, 0))
  }
}

function sendTableFull(res: Response, err: TableFullError) {
  return res.status(409).json({
    error: 'TABLE_FULL',
    message: err.message,
    remaining: err.remaining,
  })
}

function validationError(res: Response, error: { errors: { message: string }[] }) {
  return res.status(400).json({
    error: 'VALIDATION_ERROR',
    message: error.errors[0]?.message ?? '輸入資料有誤',
    details: error.errors,
  })
}

async function listSeatingImpl(_req: Request, res: Response) {
  const [tables, guests] = await Promise.all([
    prisma.seatTable.findMany({ orderBy: { tableNo: 'asc' } }),
    prisma.seatGuest.findMany({ orderBy: [{ tableNo: 'asc' }, { id: 'asc' }] }),
  ])
  return res.json({
    data: { capacity: TABLE_CAPACITY, tableCount: TABLE_COUNT, tables, guests },
  })
}

async function updateSeatTableImpl(req: Request, res: Response) {
  const tableNo = parseInt(req.params.tableNo, 10)
  if (isNaN(tableNo) || tableNo < MAIN_TABLE_NO || tableNo > MAX_TABLE_NO) {
    return res.status(400).json({ error: 'INVALID_ID' })
  }
  const result = seatTableLabelSchema.safeParse(req.body)
  if (!result.success) return validationError(res, result.error)

  const record = await prisma.seatTable.upsert({
    where: { tableNo },
    create: { tableNo, label: result.data.label },
    update: { label: result.data.label },
  })
  return res.json({ data: record })
}

async function createSeatGuestImpl(req: Request, res: Response) {
  const result = seatGuestSchema.safeParse(req.body)
  if (!result.success) return validationError(res, result.error)
  const data = result.data

  try {
    const record = await prisma.$transaction(
      async (tx) => {
        await assertCapacity(tx, data.tableNo, data.count)
        return tx.seatGuest.create({
          data: {
            tableNo: data.tableNo,
            name: data.name,
            count: data.count,
            note: data.note,
            rsvpId: data.rsvpId ?? null,
          },
        })
      }
    )
    return res.status(201).json({ data: record })
  } catch (err) {
    if (err instanceof TableFullError) return sendTableFull(res, err)
    throw err
  }
}

async function updateSeatGuestImpl(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) return res.status(400).json({ error: 'INVALID_ID' })
  const result = seatGuestSchema.safeParse(req.body)
  if (!result.success) return validationError(res, result.error)
  const data = result.data

  try {
    const record = await prisma.$transaction(
      async (tx) => {
        await assertCapacity(tx, data.tableNo, data.count, id)
        return tx.seatGuest.update({
          where: { id },
          data: {
            tableNo: data.tableNo,
            name: data.name,
            count: data.count,
            note: data.note,
            ...(data.rsvpId !== undefined ? { rsvpId: data.rsvpId } : {}),
          },
        })
      }
    )
    return res.json({ data: record })
  } catch (err: any) {
    if (err instanceof TableFullError) return sendTableFull(res, err)
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'NOT_FOUND', message: '找不到此座位紀錄' })
    }
    throw err
  }
}

async function deleteSeatGuestImpl(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) return res.status(400).json({ error: 'INVALID_ID' })
  try {
    await prisma.seatGuest.delete({ where: { id } })
    return res.status(204).send()
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'NOT_FOUND', message: '找不到此座位紀錄' })
    }
    throw err
  }
}

/** 將未預期錯誤交給 errorHandler，避免 unhandled rejection 影響整個服務 */
function safe(fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next)
  }
}

export const listSeating = safe(listSeatingImpl)
export const updateSeatTable = safe(updateSeatTableImpl)
export const createSeatGuest = safe(createSeatGuestImpl)
export const updateSeatGuest = safe(updateSeatGuestImpl)
export const deleteSeatGuest = safe(deleteSeatGuestImpl)
