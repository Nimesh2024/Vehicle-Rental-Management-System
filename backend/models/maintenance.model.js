import db from '../db.js';

export const MaintenanceModel = {
    /**
     * Get maintenance records via VehicleMaintenanceView
     */
    async getAll() {
        const [rows] = await db.query('SELECT * FROM VehicleMaintenanceView ORDER BY MaintenanceID DESC');
        return rows;
    },

    /**
     * Schedules a maintenance record using Stored Procedure AddMaintenanceRecord
     */
    async addRecord({ vehicleId, branchId, serviceDate, cost, description }) {
        return db.execute('CALL AddMaintenanceRecord(?, ?, ?, ?, ?)', [
            vehicleId,
            branchId,
            serviceDate,
            cost,
            description
        ]);
    },

    /**
     * Updates maintenance status using Stored Procedure UpdateMaintenanceStatus
     */
    async updateStatus(maintenanceId, status) {
        return db.execute('CALL UpdateMaintenanceStatus(?, ?)', [maintenanceId, status]);
    }
};

export default MaintenanceModel;
