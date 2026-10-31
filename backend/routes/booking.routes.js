import express from 'express';
import BookingController from '../controllers/booking.controller.js';

const router = express.Router();

router.get('/', BookingController.getAll);
router.post('/', BookingController.confirm);

export default router;
