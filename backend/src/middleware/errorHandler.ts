import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err)
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: '伺服器發生錯誤，請稍後再試',
  })
}
