import express from 'express';
import ReportController from '../controllers/report.controller.js';

const router = express.Router();

router.get('/executive-analytics', ReportController.getExecutiveAnalytics);
router.get('/branch-performance', ReportController.getBranchPerformance);
router.get('/branch/:branchId', ReportController.getBranchReport);
router.get('/maintenance-cost', ReportController.getMaintenanceCost);

export default router;
