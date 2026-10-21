import db from '../db.js';

export const PaymentModel = {
    /**
     * Get outstanding pending payments via OutstandingPaymentView
     */
    async getOutstanding() {
        const [rows] = await db.query('SELECT * FROM OutstandingPaymentView');
        return rows;
    },

    /**
     * Get all payment transaction logs
     */
    async getAll() {
        const [rows] = await db.query(`
            SELECT p.*, c.FirstName, c.LastName, v.Make, v.Model, v.RegistrationNumber
            FROM Payments p
            JOIN Rentals r ON p.RentalID = r.RentalID
            JOIN Bookings b ON r.BookingID = b.BookingID
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            ORDER BY p.PaymentID DESC
        `);
        return rows;
    },

    /**
     * Get revenue grouped by payment method via PaymentSummaryView
     */
    async getSummary() {
        const [rows] = await db.query('SELECT * FROM PaymentSummaryView');
        return rows;
    },

    /**
     * Settles and records payment using Stored Procedure ProcessPayment
     */
    async process({ paymentId, method, amount }) {
        return db.execute('CALL ProcessPayment(?, ?, ?)', [paymentId, method, amount]);
    },

    /**
     * Issues a refund using Stored Procedure ProcessRefund
     */
    async refund(paymentId) {
        return db.execute('CALL ProcessRefund(?)', [paymentId]);
    },

    /**
     * Get all fine records with customer and vehicle details
     */
    async getAllFines() {
        const [rows] = await db.query(`
            SELECT f.FineID, f.RentalID, f.FineType, f.Amount, f.Description, f.Status,
                   c.CustomerID, c.FirstName, c.LastName, v.RegistrationNumber
            FROM Fines f
            JOIN Rentals r ON f.RentalID = r.RentalID
            JOIN Bookings b ON r.BookingID = b.BookingID
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            ORDER BY f.FineID DESC
        `);
        return rows;
    },

    /**
     * Get detailed receipt for a specific payment ID
     */
    async getReceipt(paymentId) {
        const [rows] = await db.query(`
            SELECT p.PaymentID, p.RentalID, p.Amount, p.PaymentDate, p.PaymentMethod, p.PaymentStatus,
                   c.CustomerID, c.FirstName, c.LastName, c.Phone, c.Email,
                   v.Make, v.Model, v.RegistrationNumber,
                   IFNULL((SELECT SUM(f.Amount) FROM Fines f WHERE f.RentalID = r.RentalID), 0) AS TotalFines
            FROM Payments p
            JOIN Rentals r ON p.RentalID = r.RentalID
            JOIN Bookings b ON r.BookingID = b.BookingID
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            WHERE p.PaymentID = ?
        `, [paymentId]);
        return rows[0] || null;
    }
};

export default PaymentModel;
