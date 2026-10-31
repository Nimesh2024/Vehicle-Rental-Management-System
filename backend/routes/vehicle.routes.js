import express from 'express';
import VehicleController from '../controllers/vehicle.controller.js';

const router = express.Router();

router.get('/', VehicleController.getAvailable);
router.get('/all', VehicleController.getAll);
router.post('/', VehicleController.add);
router.put('/:id/status', VehicleController.updateStatus);

export default router;
