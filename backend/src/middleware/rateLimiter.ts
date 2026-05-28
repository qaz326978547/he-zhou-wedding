import rateLimit from 'express-rate-limit'

export const rsvpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: '提交過於頻繁，請稍後再試',
  },
})
