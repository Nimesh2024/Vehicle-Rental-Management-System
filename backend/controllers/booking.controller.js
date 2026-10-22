import BookingModel from '../models/booking.model.js';

export const BookingController = {
    async getAll(req, res) {
        try {
            const branchId = req.query.branchId ? parseInt(req.query.branchId, 10) : null;
            const rows = await BookingModel.getAllBookings(branchId);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async confirm(req, res) {
        const { customerId, vehicleId, startDate, endDate, depositAmount } = req.body;
        try {
            await BookingModel.confirmBooking({ customerId, vehicleId, startDate, endDate, depositAmount });
            res.status(201).json({ 
                success: true, 
                message: `Reservation confirmed! Security deposit of LKR ${Number(depositAmount || 25000).toLocaleString()} successfully authorized via Card.` 
            });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default BookingController;
