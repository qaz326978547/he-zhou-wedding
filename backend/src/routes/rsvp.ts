import { Router } from 'express'
import { rsvpRateLimiter } from '../middleware/rateLimiter'
import { submitRsvp, getRsvpStatus, healthCheck } from '../controllers/rsvpController'

const router = Router()

router.get('/health', healthCheck)
router.get('/rsvp/status', getRsvpStatus)
router.post('/rsvp', rsvpRateLimiter, submitRsvp)

export default router
