import CustomerModel from '../models/customer.model.js';

export const CustomerController = {
    async getActive(req, res) {
        try {
            const rows = await CustomerModel.getActiveCustomers();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getAll(req, res) {
        try {
            const rows = await CustomerModel.getAllWithDetails();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async register(req, res) {
        const { username, password, firstName, lastName, nic, dob, phone, email, address } = req.body;
        try {
            await CustomerModel.register({
                username,
                password,
                roleId: 4,
                firstName,
                lastName,
                nic,
                dob,
                phone,
                email,
                address
            });
            res.status(201).json({ success: true, message: 'Customer registered successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    async update(req, res) {
        const customerId = req.params.id;
        const { phone, email, address } = req.body;
        try {
            await CustomerModel.update(customerId, { phone, email, address });
            res.json({ success: true, message: 'Customer profile updated successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    async getBookings(req, res) {
        const customerId = req.params.customerId;
        try {
            const rows = await CustomerModel.getBookings(customerId);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getRentals(req, res) {
        const customerId = req.params.customerId;
        try {
            const rows = await CustomerModel.getRentalHistory(customerId);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getFines(req, res) {
        const customerId = req.params.customerId;
        try {
            const rows = await CustomerModel.getFines(customerId);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default CustomerController;
