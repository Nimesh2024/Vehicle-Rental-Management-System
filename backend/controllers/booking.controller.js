import BookingModel from '../models/booking.model.js';

export const BookingController = {
    async getAll(req, res) {
        try {
            const rows = await BookingModel.getAllBookings();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async confirm(req, res) {
        const { customerId, vehicleId, startDate, endDate } = req.body;
        try {
            await BookingModel.confirmBooking({ customerId, vehicleId, startDate, endDate });
            res.status(201).json({ success: true, message: 'Booking confirmed successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default BookingController;
