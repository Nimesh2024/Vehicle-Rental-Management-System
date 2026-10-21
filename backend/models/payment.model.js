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
     * Get full receipt data for a specific payment (for receipt generation)
     */
    async getReceiptData(paymentId) {
        const [[payment]] = await db.query(`
            SELECT
                p.PaymentID,
                p.RentalID,
                p.Amount         AS TotalAmount,
                p.PaymentDate,
                p.PaymentMethod,
                p.PaymentStatus,
                r.RentalDate,
                r.ActualStartDate,
                r.ActualEndDate,
                r.StartMileage,
                r.EndMileage,
                b.StartDate,
                b.EndDate,
                DATEDIFF(b.EndDate, b.StartDate) AS RentalDays,
                vc.DailyRate,
                DATEDIFF(b.EndDate, b.StartDate) * vc.DailyRate AS RentalCharge,
                c.CustomerID,
                c.FirstName,
                c.LastName,
                c.Phone,
                c.Email,
                c.NIC_Passport,
                v.VehicleID,
                v.Make,
                v.Model,
                v.RegistrationNumber,
                v.Year           AS VehicleYear,
                vc.CategoryName
            FROM Payments p
            JOIN Rentals r         ON p.RentalID    = r.RentalID
            JOIN Bookings b        ON r.BookingID   = b.BookingID
            JOIN Customers c       ON b.CustomerID  = c.CustomerID
            JOIN Vehicles v        ON b.VehicleID   = v.VehicleID
            JOIN VehicleCategories vc ON v.CategoryID = vc.CategoryID
            WHERE p.PaymentID = ?
        `, [paymentId]);

        if (!payment) return null;

        // Fetch fines linked to this rental
        const [fines] = await db.query(`
            SELECT FineID, FineType, Amount, Description, Status
            FROM Fines
            WHERE RentalID = ?
            ORDER BY FineID ASC
        `, [payment.RentalID]);

        const fineTotal = fines.reduce((sum, f) => sum + Number(f.Amount), 0);
        const year      = new Date(payment.PaymentDate || Date.now()).getFullYear();
        const receiptNo = `REC-${year}-${String(paymentId).padStart(4, '0')}`;

        return { ...payment, fines, fineTotal, receiptNo, discount: 0 };
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
