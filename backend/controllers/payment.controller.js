import PaymentModel from '../models/payment.model.js';

export const PaymentController = {
    async getOutstanding(req, res) {
        try {
            const rows = await PaymentModel.getOutstanding();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getAll(req, res) {
        try {
            const rows = await PaymentModel.getAll();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getSummary(req, res) {
        try {
            const rows = await PaymentModel.getSummary();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async process(req, res) {
        const { paymentId, method, amount } = req.body;
        try {
            await PaymentModel.process({ paymentId, method, amount });
            res.json({ success: true, message: 'Payment completed successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    async refund(req, res) {
        const { paymentId } = req.body;
        try {
            await PaymentModel.refund(paymentId);
            res.json({ success: true, message: 'Payment refunded successfully' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    async getFines(req, res) {
        try {
            const rows = await PaymentModel.getAllFines();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    async getReceipt(req, res) {
        try {
            const receipt = await PaymentModel.getReceiptData(parseInt(req.params.id));
            if (!receipt) return res.status(404).json({ error: 'Receipt not found.' });
            res.json(receipt);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default PaymentController;
