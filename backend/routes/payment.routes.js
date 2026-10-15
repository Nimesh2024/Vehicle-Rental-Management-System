import express from 'express';
import PaymentController from '../controllers/payment.controller.js';

const router = express.Router();

router.get('/outstanding', PaymentController.getOutstanding);
router.get('/all', PaymentController.getAll);
router.get('/summary', PaymentController.getSummary);
router.post('/process', PaymentController.process);
router.post('/refund', PaymentController.refund);

export default router;
