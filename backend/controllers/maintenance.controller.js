import MaintenanceModel from '../models/maintenance.model.js';

export const MaintenanceController = {
    async getAll(req, res) {
        try {
            const rows = await MaintenanceModel.getAll();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async add(req, res) {
        const { vehicleId, branchId, serviceDate, cost, description } = req.body;
        try {
            await MaintenanceModel.addRecord({ vehicleId, branchId, serviceDate, cost, description });
            res.status(201).json({ success: true, message: 'Maintenance record scheduled successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    async updateStatus(req, res) {
        const maintenanceId = req.params.id;
        const { status } = req.body;
        try {
            await MaintenanceModel.updateStatus(maintenanceId, status);
            res.json({ success: true, message: 'Maintenance status updated successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default MaintenanceController;
