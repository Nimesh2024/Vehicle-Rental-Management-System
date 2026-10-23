import RentalModel from '../models/rental.model.js';

export const RentalController = {
    async getActive(req, res) {
        try {
            const branchId = req.query.branchId ? parseInt(req.query.branchId, 10) : null;
            const rows = await RentalModel.getActiveRentals(branchId);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async start(req, res) {
        const { bookingId, startMileage } = req.body;
        try {
            await RentalModel.createRental({ bookingId, startMileage });
            res.status(201).json({ success: true, message: 'Rental started successfully! Vehicle marked as Rented.' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    async processReturn(req, res) {
        const { rentalId, endMileage, damageCost } = req.body;
        try {
            await RentalModel.processReturn({ rentalId, endMileage, damageCost });
            res.json({ success: true, message: 'Vehicle returned successfully. Status reset to Available.' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    async cancel(req, res) {
        const rentalId = req.params.id;
        try {
            await RentalModel.cancelRental(rentalId);
            res.json({ success: true, message: 'Rental cancelled successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default RentalController;
