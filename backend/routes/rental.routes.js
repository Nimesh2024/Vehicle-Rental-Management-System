import express from 'express';
import RentalController from '../controllers/rental.controller.js';

const router = express.Router();

router.get('/active', RentalController.getActive);
router.post('/start', RentalController.start);
router.post('/return', RentalController.processReturn);
router.post('/:id/cancel', RentalController.cancel);

export default router;
