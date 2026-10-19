import DashboardModel from '../models/dashboard.model.js';

export const DashboardController = {
    async getStats(req, res) {
        try {
            const stats = await DashboardModel.getStats();
            res.json(stats);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getAuditLogs(req, res) {
        try {
            const rows = await DashboardModel.getAuditLogs(50);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default DashboardController;
