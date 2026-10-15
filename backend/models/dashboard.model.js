import db from '../db.js';

export const DashboardModel = {
    /**
     * Get real-time audit logs triggered by database changes
     */
    async getAuditLogs(limit = 50) {
        const [rows] = await db.query(
            'SELECT * FROM AuditLogs ORDER BY ActionTimestamp DESC LIMIT ?',
            [limit]
        );
        return rows;
    },

    /**
     * Aggregates key platform indicators for the executive dashboard
     */
    async getStats() {
        const [customers] = await db.query('SELECT COUNT(*) as count FROM ActiveCustomerView');
        const [vehicles] = await db.query('SELECT COUNT(*) as count FROM AvailableVehiclesView');
        const [rentals] = await db.query('SELECT COUNT(*) as count FROM ActiveRentalsView');
        const [maintenance] = await db.query(
            "SELECT COUNT(*) as count FROM VehicleMaintenanceView WHERE MaintenanceStatus = 'In_Progress'"
        );
        const [revenue] = await db.query(
            "SELECT IFNULL(SUM(Amount), 0) as total FROM Payments WHERE PaymentStatus = 'Completed'"
        );

        return {
            customers: customers[0].count,
            vehicles: vehicles[0].count,
            rentals: rentals[0].count,
            maintenance: maintenance[0].count,
            totalRevenue: revenue[0].total
        };
    }
};

export default DashboardModel;
