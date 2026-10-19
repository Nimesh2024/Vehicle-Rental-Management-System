import db from '../db.js';

export const BookingModel = {
    /**
     * Get all bookings joined with customer and vehicle details
     */
    async getAllBookings() {
        const [rows] = await db.query(`
            SELECT b.BookingID, b.CustomerID, b.VehicleID, b.StartDate, b.EndDate, b.Status, b.BookingDate,
                   c.FirstName, c.LastName, c.Phone, v.Make, v.Model, v.RegistrationNumber, cat.DailyRate
            FROM Bookings b
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            JOIN VehicleCategories cat ON v.CategoryID = cat.CategoryID
            ORDER BY b.BookingID DESC
        `);
        return rows;
    },

    /**
     * Creates and confirms a booking using Stored Procedure ConfirmBooking
     */
    async confirmBooking({ customerId, vehicleId, startDate, endDate }) {
        return db.execute('CALL ConfirmBooking(?, ?, ?, ?)', [
            customerId,
            vehicleId,
            startDate,
            endDate
        ]);
    }
};

export default BookingModel;
