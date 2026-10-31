import express from 'express';
import MaintenanceController from '../controllers/maintenance.controller.js';

const router = express.Router();

router.get('/', MaintenanceController.getAll);
router.post('/', MaintenanceController.add);
router.put('/:id/status', MaintenanceController.updateStatus);

export default router;
