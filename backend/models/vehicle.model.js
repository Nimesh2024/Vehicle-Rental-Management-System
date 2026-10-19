import db from '../db.js';

export const VehicleModel = {
    /**
     * Get available vehicles from AvailableVehiclesView
     */
    async getAvailableVehicles() {
        const [rows] = await db.query('SELECT * FROM AvailableVehiclesView');
        return rows;
    },

    /**
     * Get all fleet vehicles joined with categories, branches, and UDF VehicleAge
     */
    async getAllWithDetails() {
        const [rows] = await db.query(`
            SELECT v.*, c.CategoryName, c.DailyRate, b.BranchName, VehicleAge(v.PurchaseDate) as AgeYears
            FROM Vehicles v
            JOIN VehicleCategories c ON v.CategoryID = c.CategoryID
            JOIN Branches b ON v.BranchID = b.BranchID
            ORDER BY v.VehicleID ASC
        `);
        return rows;
    },

    /**
     * Adds a new vehicle using Stored Procedure AddVehicle
     */
    async add({ categoryId, branchId, make, model, year, registration, purchaseDate }) {
        return db.execute('CALL AddVehicle(?, ?, ?, ?, ?, ?, ?)', [
            categoryId,
            branchId,
            make,
            model,
            year,
            registration,
            purchaseDate
        ]);
    },

    /**
     * Updates vehicle status using Stored Procedure UpdateVehicleStatus
     */
    async updateStatus(vehicleId, status) {
        return db.execute('CALL UpdateVehicleStatus(?, ?)', [vehicleId, status]);
    },

    /**
     * Get all branches
     */
    async getBranches() {
        const [rows] = await db.query('SELECT * FROM Branches ORDER BY BranchID ASC');
        return rows;
    },

    /**
     * Get all vehicle categories
     */
    async getCategories() {
        const [rows] = await db.query('SELECT * FROM VehicleCategories ORDER BY CategoryID ASC');
        return rows;
    }
};

export default VehicleModel;
