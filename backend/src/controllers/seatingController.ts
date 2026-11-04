import { Request, Response, NextFunction, RequestHandler } from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
  TABLE_CAPACITY,
  TABLE_COUNT,
  MAIN_TABLE_NO,
  MAX_TABLE_NO,
  seatGuestSchema,
  seatTableSchema,
  swapTablesSchema,
  MAX_TABLE_CAPACITY,
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
  const [table, agg] = await Promise.all([
    tx.seatTable.findUnique({ where: { tableNo } }),
    tx.seatGuest.aggregate({
      _sum: { count: true },
      where: { tableNo, ...(excludeId ? { id: { not: excludeId } } : {}) },
    }),
  ])
  const capacity = table?.capacity ?? TABLE_CAPACITY
  const used = agg._sum.count ?? 0
  if (used + count > capacity) {
    throw new TableFullError(tableNo, Math.max(capacity - used, 0))
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
    data: {
      capacity: TABLE_CAPACITY,
      maxCapacity: MAX_TABLE_CAPACITY,
      tableCount: TABLE_COUNT,
      tables,
      guests,
    },
  })
}

async function updateSeatTableImpl(req: Request, res: Response) {
  const tableNo = parseInt(req.params.tableNo, 10)
  if (isNaN(tableNo) || tableNo < MAIN_TABLE_NO || tableNo > MAX_TABLE_NO) {
    return res.status(400).json({ error: 'INVALID_ID' })
  }
  const result = seatTableSchema.safeParse(req.body)
  if (!result.success) return validationError(res, result.error)
  const { label, capacity } = result.data

  const data: { label?: string | null; capacity?: number } = {}
  if (label !== undefined) data.label = label || null
  if (capacity !== undefined) {
    // 座位數不可少於目前已安排人數
    const agg = await prisma.seatGuest.aggregate({ _sum: { count: true }, where: { tableNo } })
    const used = agg._sum.count ?? 0
    if (capacity < used) {
      return res.status(409).json({
        error: 'CAPACITY_BELOW_SEATED',
        message: `此桌已安排 ${used} 位，座位數不可少於 ${used}`,
      })
    }
    data.capacity = capacity
  }

  const record = await prisma.seatTable.upsert({
    where: { tableNo },
    create: { tableNo, ...data },
    update: data,
  })
  return res.json({ data: record })
}

/** 兩桌整桌互換：賓客、桌名、座位數一起交換，因此不會發生超額 */
async function swapSeatTablesImpl(req: Request, res: Response) {
  const result = swapTablesSchema.safeParse(req.body)
  if (!result.success) return validationError(res, result.error)
  const { a, b } = result.data

  await prisma.$transaction(async (tx) => {
    const [guestsA, tableA, tableB] = await Promise.all([
      tx.seatGuest.findMany({ where: { tableNo: a }, select: { id: true } }),
      tx.seatTable.findUnique({ where: { tableNo: a } }),
      tx.seatTable.findUnique({ where: { tableNo: b } }),
    ])
    // 先記下 A 桌賓客 id，再把 B 桌移到 A，最後把原 A 桌賓客移到 B
    await tx.seatGuest.updateMany({ where: { tableNo: b }, data: { tableNo: a } })
    await tx.seatGuest.updateMany({
      where: { id: { in: guestsA.map((g) => g.id) } },
      data: { tableNo: b },
    })

    const settingsA = { label: tableA?.label ?? null, capacity: tableA?.capacity ?? TABLE_CAPACITY }
    const settingsB = { label: tableB?.label ?? null, capacity: tableB?.capacity ?? TABLE_CAPACITY }
    await tx.seatTable.upsert({ where: { tableNo: a }, create: { tableNo: a, ...settingsB }, update: settingsB })
    await tx.seatTable.upsert({ where: { tableNo: b }, create: { tableNo: b, ...settingsA }, update: settingsA })
  })

  return listSeatingImpl(req, res)
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
export const swapSeatTables = safe(swapSeatTablesImpl)
export const createSeatGuest = safe(createSeatGuestImpl)
export const updateSeatGuest = safe(updateSeatGuestImpl)
export const deleteSeatGuest = safe(deleteSeatGuestImpl)
