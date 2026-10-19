import db from '../db.js';

export const RentalModel = {
    /**
     * Get all active ongoing rentals
     */
    async getActiveRentals() {
        const [rows] = await db.query(`
            SELECT r.RentalID, r.BookingID, r.RentalDate, r.ActualStartDate, r.RentalStatus, r.StartMileage,
                   c.CustomerID, c.FirstName, c.LastName, c.Phone,
                   v.VehicleID, v.Make, v.Model, v.RegistrationNumber,
                   p.PaymentID, p.Amount, p.PaymentStatus
            FROM Rentals r
            JOIN Bookings b ON r.BookingID = b.BookingID
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            LEFT JOIN Payments p ON r.RentalID = p.RentalID
            WHERE r.RentalStatus = 'Ongoing'
            ORDER BY r.RentalID DESC
        `);
        return rows;
    },

    /**
     * Dispatches vehicle & starts rental using Stored Procedure CreateRental
     */
    async createRental({ bookingId, startMileage = 0 }) {
        return db.execute('CALL CreateRental(?, ?)', [bookingId, startMileage]);
    },

    /**
     * Processes vehicle check-in and returns using Stored Procedure ProcessVehicleReturn
     */
    async processReturn({ rentalId, endMileage = 0, damageCost = 0 }) {
        return db.execute('CALL ProcessVehicleReturn(?, ?, ?)', [
            rentalId,
            endMileage,
            damageCost
        ]);
    },

    /**
     * Cancels a rental using Stored Procedure CancelRental
     */
    async cancelRental(rentalId) {
        return db.execute('CALL CancelRental(?)', [rentalId]);
    }
};

export default RentalModel;
