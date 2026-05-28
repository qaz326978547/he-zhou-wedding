import { Router } from 'express'
import { adminAuth } from '../middleware/adminAuth'
import {
  loginAdmin,
  listRsvp,
  createRsvp,
  updateRsvp,
  deleteRsvp,
} from '../controllers/adminController'

const router = Router()

router.post('/login', loginAdmin)
router.get('/rsvp', adminAuth, listRsvp)
router.post('/rsvp', adminAuth, createRsvp)
router.put('/rsvp/:id', adminAuth, updateRsvp)
router.delete('/rsvp/:id', adminAuth, deleteRsvp)

export default router
