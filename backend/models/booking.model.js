import db from '../db.js';

export const BookingModel = {
    /**
     * Get all bookings joined with customer and vehicle details
     */
    async getAllBookings(branchId = null) {
        let sql = `
            SELECT b.BookingID, b.CustomerID, b.VehicleID, b.StartDate, b.EndDate, b.Status, b.BookingDate,
                   b.DepositAmount, b.DepositStatus, b.DepositPaymentMethod,
                   c.FirstName, c.LastName, c.Phone, v.Make, v.Model, v.RegistrationNumber, cat.DailyRate,
                   v.BranchID, br.BranchName
            FROM Bookings b
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            JOIN VehicleCategories cat ON v.CategoryID = cat.CategoryID
            LEFT JOIN Branches br ON v.BranchID = br.BranchID
        `;
        const params = [];
        if (branchId) {
            sql += ' WHERE v.BranchID = ?';
            params.push(branchId);
        }
        sql += ' ORDER BY b.BookingID DESC';
        const [rows] = await db.query(sql, params);
        return rows;
    },

    /**
     * Creates and confirms a booking using Stored Procedure ConfirmBooking
     */
    async confirmBooking({ customerId, vehicleId, startDate, endDate, depositAmount = 25000 }) {
        return db.execute('CALL ConfirmBooking(?, ?, ?, ?, ?)', [
            customerId,
            vehicleId,
            startDate,
            endDate,
            depositAmount
        ]);
    }
};

export default BookingModel;
