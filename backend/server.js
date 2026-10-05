const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// --- Member 1: Customer Management ---
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM ActiveCustomerView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Member 2: Vehicle Management ---
app.get('/api/vehicles', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM AvailableVehiclesView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/vehicles', async (req, res) => {
    const { categoryId, branchId, make, model, year, registration, purchaseDate } = req.body;
    try {
        await db.execute('CALL AddVehicle(?, ?, ?, ?, ?, ?, ?)', 
            [categoryId, branchId, make, model, year, registration, purchaseDate]);
        res.status(201).json({ message: 'Vehicle added successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- Member 3: Booking Management ---
app.get('/api/rentals/active', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM ActiveRentalsView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Member 4: Payments ---
app.get('/api/payments/outstanding', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM OutstandingPaymentView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Member 5: Maintenance ---
app.get('/api/maintenance', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM VehicleMaintenanceView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [customers] = await db.query("SELECT COUNT(*) as count FROM ActiveCustomerView");
        const [vehicles] = await db.query("SELECT COUNT(*) as count FROM AvailableVehiclesView");
        const [rentals] = await db.query("SELECT COUNT(*) as count FROM ActiveRentalsView");
        const [maintenance] = await db.query("SELECT COUNT(*) as count FROM VehicleMaintenanceView WHERE MaintenanceStatus = 'In_Progress'");
        
        res.json({
            customers: customers[0].count,
            vehicles: vehicles[0].count,
            rentals: rentals[0].count,
            maintenance: maintenance[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
