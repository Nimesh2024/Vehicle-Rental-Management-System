import ReportModel from '../models/report.model.js';

export const ReportController = {
    async getBranchPerformance(req, res) {
        try {
            const rows = await ReportModel.getBranchPerformance();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getBranchReport(req, res) {
        const branchId = req.params.branchId;
        try {
            const results = await ReportModel.generateBranchReport(branchId);
            res.json(results);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getMaintenanceCost(req, res) {
        try {
            const rows = await ReportModel.getMaintenanceCostSummary();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default ReportController;
