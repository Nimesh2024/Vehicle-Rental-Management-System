import db from '../db.js';

export const ReportModel = {
    /**
     * Get branch performance metrics via BranchPerformanceView
     */
    async getBranchPerformance() {
        const [rows] = await db.query('SELECT * FROM BranchPerformanceView');
        return rows;
    },

    /**
     * Generates a specific branch report using Stored Procedure GenerateBranchReport
     */
    async generateBranchReport(branchId) {
        const [results] = await db.query('CALL GenerateBranchReport(?)', [branchId]);
        return results[0] || [];
    },

    /**
     * Get maintenance cost summary per vehicle via MaintenanceCostView
     */
    async getMaintenanceCostSummary() {
        const [rows] = await db.query('SELECT * FROM MaintenanceCostView');
        return rows;
    }
};

export default ReportModel;
