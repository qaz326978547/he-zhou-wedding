import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: '請先登入' })
  }
  try {
    jwt.verify(auth.slice(7), process.env.JWT_SECRET!)
    next()
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token 已過期或無效，請重新登入' })
  }
}
