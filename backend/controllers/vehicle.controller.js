import VehicleModel from '../models/vehicle.model.js';

export const VehicleController = {
    async getAvailable(req, res) {
        try {
            const rows = await VehicleModel.getAvailableVehicles();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getAll(req, res) {
        try {
            const rows = await VehicleModel.getAllWithDetails();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async add(req, res) {
        const { categoryId, branchId, make, model, year, registration, purchaseDate } = req.body;
        try {
            await VehicleModel.add({
                categoryId,
                branchId,
                make,
                model,
                year,
                registration,
                purchaseDate
            });
            res.status(201).json({ success: true, message: 'Vehicle added successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    async updateStatus(req, res) {
        const vehicleId = req.params.id;
        const { status } = req.body;
        try {
            await VehicleModel.updateStatus(vehicleId, status);
            res.json({ success: true, message: 'Vehicle status updated successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    async getBranches(req, res) {
        try {
            const rows = await VehicleModel.getBranches();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getCategories(req, res) {
        try {
            const rows = await VehicleModel.getCategories();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default VehicleController;
