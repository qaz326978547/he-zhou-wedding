import { Router } from 'express'
import { adminAuth } from '../middleware/adminAuth'
import {
  loginAdmin,
  listRsvp,
  createRsvp,
  updateRsvp,
  deleteRsvp,
  listRedEnvelope,
  updateRedEnvelope,
  deleteRedEnvelope,
} from '../controllers/adminController'

const router = Router()

router.post('/login', loginAdmin)
router.get('/rsvp', adminAuth, listRsvp)
router.post('/rsvp', adminAuth, createRsvp)
router.put('/rsvp/:id', adminAuth, updateRsvp)
router.delete('/rsvp/:id', adminAuth, deleteRsvp)

router.get('/red-envelope', adminAuth, listRedEnvelope)
router.put('/red-envelope/:id', adminAuth, updateRedEnvelope)
router.delete('/red-envelope/:id', adminAuth, deleteRedEnvelope)

export default router
