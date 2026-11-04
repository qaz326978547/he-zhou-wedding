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
import {
  listSeating,
  updateSeatTable,
  swapSeatTables,
  createSeatGuest,
  updateSeatGuest,
  deleteSeatGuest,
} from '../controllers/seatingController'

const router = Router()

router.post('/login', loginAdmin)
router.get('/rsvp', adminAuth, listRsvp)
router.post('/rsvp', adminAuth, createRsvp)
router.put('/rsvp/:id', adminAuth, updateRsvp)
router.delete('/rsvp/:id', adminAuth, deleteRsvp)

router.get('/red-envelope', adminAuth, listRedEnvelope)
router.put('/red-envelope/:id', adminAuth, updateRedEnvelope)
router.delete('/red-envelope/:id', adminAuth, deleteRedEnvelope)

router.get('/seating', adminAuth, listSeating)
router.post('/seating/tables/swap', adminAuth, swapSeatTables)
router.put('/seating/tables/:tableNo', adminAuth, updateSeatTable)
router.post('/seating/guests', adminAuth, createSeatGuest)
router.put('/seating/guests/:id', adminAuth, updateSeatGuest)
router.delete('/seating/guests/:id', adminAuth, deleteSeatGuest)

export default router
