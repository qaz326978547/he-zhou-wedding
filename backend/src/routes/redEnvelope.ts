import { Router } from 'express'
import { rsvpRateLimiter } from '../middleware/rateLimiter'
import { submitRedEnvelope } from '../controllers/redEnvelopeController'

const router = Router()

router.post('/red-envelope', rsvpRateLimiter, submitRedEnvelope)

export default router
