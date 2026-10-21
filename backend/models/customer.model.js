import db from '../db.js';

export const CustomerModel = {
    /**
     * Get active customers from ActiveCustomerView
     */
    async getActiveCustomers() {
        const [rows] = await db.query('SELECT * FROM ActiveCustomerView');
        return rows;
    },

    /**
     * Get all customers with User info and UDF calculated fields (CustomerAge, CustomerRentalCount)
     */
    async getAllWithDetails() {
        const [rows] = await db.query(`
            SELECT c.*, u.Username, CustomerAge(c.DOB) as Age, CustomerRentalCount(c.CustomerID) as TotalRentals
            FROM Customers c
            JOIN Users u ON c.UserID = u.UserID
            ORDER BY c.CustomerID ASC
        `);
        return rows;
    },

    /**
     * Registers a customer using Stored Procedure RegisterCustomer
     */
    async register({ username, password, roleId = 4, firstName, lastName, nic, dob, phone, email, address }) {
        return db.query('CALL RegisterCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            username,
            password || 'password123',
            parseInt(roleId, 10) || 4,
            firstName,
            lastName,
            nic,
            dob,
            phone,
            email,
            address
        ]);
    },

    /**
     * Updates customer phone, email, and address using Stored Procedure UpdateCustomer
     */
    async update(customerId, { phone, email, address }) {
        return db.execute('CALL UpdateCustomer(?, ?, ?, ?)', [
            customerId,
            phone,
            email,
            address
        ]);
    },

    /**
     * Get bookings for a specific customer
     */
    async getBookings(customerId) {
        const [rows] = await db.query(`
            SELECT b.BookingID, b.StartDate, b.EndDate, b.Status, b.BookingDate,
                   v.Make, v.Model, v.RegistrationNumber, cat.DailyRate
            FROM Bookings b
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            JOIN VehicleCategories cat ON v.CategoryID = cat.CategoryID
            WHERE b.CustomerID = ?
            ORDER BY b.BookingID DESC
        `, [customerId]);
        return rows;
    },

    /**
     * Get rental history for a specific customer via CustomerRentalHistoryView
     */
    async getRentalHistory(customerId) {
        const [rows] = await db.query('SELECT * FROM CustomerRentalHistoryView WHERE CustomerID = ?', [customerId]);
        return rows;
    },

    /**
     * Get fines issued to a specific customer
     */
    async getFines(customerId) {
        const [rows] = await db.query(`
            SELECT f.FineID, f.FineType, f.Amount, f.Description, f.Status, f.RentalID, v.RegistrationNumber
            FROM Fines f
            JOIN Rentals r ON f.RentalID = r.RentalID
            JOIN Bookings b ON r.BookingID = b.BookingID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            WHERE b.CustomerID = ?
            ORDER BY f.FineID DESC
        `, [customerId]);
        return rows;
    }
};

export default CustomerModel;
