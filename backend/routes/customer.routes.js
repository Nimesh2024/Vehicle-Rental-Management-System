import express from 'express';
import CustomerController from '../controllers/customer.controller.js';

const router = express.Router();

router.get('/', CustomerController.getActive);
router.get('/all', CustomerController.getAll);
router.post('/register', CustomerController.register);
router.put('/:id', CustomerController.update);

// Customer-specific subroutes
router.get('/:customerId/bookings', CustomerController.getBookings);
router.get('/:customerId/rentals', CustomerController.getRentals);
router.get('/:customerId/fines', CustomerController.getFines);

export default router;
