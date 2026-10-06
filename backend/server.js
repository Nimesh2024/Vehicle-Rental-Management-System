const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. AUTHENTICATION & MEMBER 1 (Customer & User Management)
// ==========================================

// Authenticate User (Stored Procedure with Error Handling)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const [results] = await db.query('CALL AuthenticateUser(?, ?)', [username, password]);
        if (results && results[0] && results[0][0]) {
            res.json({ success: true, user: results[0][0] });
        } else {
            res.status(401).json({ error: 'Authentication failed.' });
        }
    } catch (err) {
        res.status(401).json({ error: err.sqlMessage || err.message });
    }
});

// Get Active Customers (View)
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM ActiveCustomerView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get All Customers with Full Details
app.get('/api/customers/all', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, u.Username, CustomerAge(c.DOB) as Age, CustomerRentalCount(c.CustomerID) as TotalRentals
            FROM Customers c
            JOIN Users u ON c.UserID = u.UserID
            ORDER BY c.CustomerID ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Register New Customer (Stored Procedure with Transaction)
app.post('/api/customers/register', async (req, res) => {
    const { username, password, firstName, lastName, nic, dob, phone, email, address } = req.body;
    try {
        // Default role 4 is 'Customer'
        const roleId = 4;
        await db.execute('CALL RegisterCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [username, password || 'password123', roleId, firstName, lastName, nic, dob, phone, email, address]);
        res.status(201).json({ success: true, message: 'Customer registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// Update Customer Details (Stored Procedure)
app.put('/api/customers/:id', async (req, res) => {
    const customerId = req.params.id;
    const { phone, email, address } = req.body;
    try {
        await db.execute('CALL UpdateCustomer(?, ?, ?, ?)', [customerId, phone, email, address]);
        res.json({ success: true, message: 'Customer profile updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// ==========================================
// 2. MEMBER 2 (Vehicle & Fleet Management)
// ==========================================

// Get Available Vehicles (View)
app.get('/api/vehicles', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM AvailableVehiclesView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get All Vehicles with Category and Branch
app.get('/api/vehicles/all', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT v.*, c.CategoryName, c.DailyRate, b.BranchName, VehicleAge(v.PurchaseDate) as AgeYears
            FROM Vehicles v
            JOIN VehicleCategories c ON v.CategoryID = c.CategoryID
            JOIN Branches b ON v.BranchID = b.BranchID
            ORDER BY v.VehicleID ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get Branches List
app.get('/api/branches', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Branches ORDER BY BranchID ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get Vehicle Categories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM VehicleCategories ORDER BY CategoryID ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Add New Vehicle (Stored Procedure with Error Handling)
app.post('/api/vehicles', async (req, res) => {
    const { categoryId, branchId, make, model, year, registration, purchaseDate } = req.body;
    try {
        await db.execute('CALL AddVehicle(?, ?, ?, ?, ?, ?, ?)', 
            [categoryId, branchId, make, model, year, registration, purchaseDate]);
        res.status(201).json({ success: true, message: 'Vehicle added successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// Update Vehicle Status (Stored Procedure)
app.put('/api/vehicles/:id/status', async (req, res) => {
    const vehicleId = req.params.id;
    const { status } = req.body;
    try {
        await db.execute('CALL UpdateVehicleStatus(?, ?)', [vehicleId, status]);
        res.json({ success: true, message: 'Vehicle status updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// ==========================================
// 3. MEMBER 3 (Rental & Booking Management)
// ==========================================

// Get All Bookings (View)
app.get('/api/bookings', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT b.BookingID, b.CustomerID, b.VehicleID, b.StartDate, b.EndDate, b.Status, b.BookingDate,
                   c.FirstName, c.LastName, c.Phone, v.Make, v.Model, v.RegistrationNumber, cat.DailyRate
            FROM Bookings b
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            JOIN VehicleCategories cat ON v.CategoryID = cat.CategoryID
            ORDER BY b.BookingID DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get Bookings for a Specific Customer
app.get('/api/customer/:customerId/bookings', async (req, res) => {
    const customerId = req.params.customerId;
    try {
        const [rows] = await db.query(`
            SELECT b.BookingID, b.StartDate, b.EndDate, b.Status, b.BookingDate,
                   v.Make, v.Model, v.RegistrationNumber, cat.DailyRate
            FROM Bookings b
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            JOIN VehicleCategories cat ON v.CategoryID = cat.CategoryID
            WHERE b.CustomerID = ?
            ORDER BY b.BookingID DESC
        `, [customerId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Create / Confirm Booking (Stored Procedure with Date & Conflict Check)
app.post('/api/bookings', async (req, res) => {
    const { customerId, vehicleId, startDate, endDate } = req.body;
    try {
        await db.execute('CALL ConfirmBooking(?, ?, ?, ?)', [customerId, vehicleId, startDate, endDate]);
        res.status(201).json({ success: true, message: 'Booking confirmed successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// Get Active Rentals (View)
app.get('/api/rentals/active', async (req, res) => {
    try {
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
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get Rental History for a Specific Customer (View)
app.get('/api/customer/:customerId/rentals', async (req, res) => {
    const customerId = req.params.customerId;
    try {
        const [rows] = await db.query("SELECT * FROM CustomerRentalHistoryView WHERE CustomerID = ?", [customerId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Start Rental / Check-Out (Stored Procedure with Trigger on Vehicle Status)
app.post('/api/rentals/start', async (req, res) => {
    const { bookingId, startMileage } = req.body;
    try {
        await db.execute('CALL CreateRental(?, ?)', [bookingId, startMileage || 0]);
        res.status(201).json({ success: true, message: 'Rental started successfully! Vehicle marked as Rented.' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// Cancel Rental (Stored Procedure)
app.post('/api/rentals/:id/cancel', async (req, res) => {
    const rentalId = req.params.id;
    try {
        await db.execute('CALL CancelRental(?)', [rentalId]);
        res.json({ success: true, message: 'Rental cancelled successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// ==========================================
// 4. MEMBER 4 (Payment, Return & Fine Management)
// ==========================================

// Get Outstanding Payments (View)
app.get('/api/payments/outstanding', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM OutstandingPaymentView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get All Payments
app.get('/api/payments/all', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, c.FirstName, c.LastName, v.Make, v.Model, v.RegistrationNumber
            FROM Payments p
            JOIN Rentals r ON p.RentalID = r.RentalID
            JOIN Bookings b ON r.BookingID = b.BookingID
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            ORDER BY p.PaymentID DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get Payment Revenue Summary (View)
app.get('/api/payments/summary', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM PaymentSummaryView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get Customer Fines (View)
app.get('/api/fines', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT f.FineID, f.RentalID, f.FineType, f.Amount, f.Description, f.Status,
                   c.CustomerID, c.FirstName, c.LastName, v.RegistrationNumber
            FROM Fines f
            JOIN Rentals r ON f.RentalID = r.RentalID
            JOIN Bookings b ON r.BookingID = b.BookingID
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            ORDER BY f.FineID DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Get Fines for Customer
app.get('/api/customer/:customerId/fines', async (req, res) => {
    const customerId = req.params.customerId;
    try {
        const [rows] = await db.query(`
            SELECT f.FineID, f.FineType, f.Amount, f.Description, f.Status, f.RentalID, v.RegistrationNumber
            FROM Fines f
            JOIN Rentals r ON f.RentalID = r.RentalID
            JOIN Bookings b ON r.BookingID = b.BookingID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            WHERE b.CustomerID = ?
            ORDER BY f.FineID DESC
        `, [customerId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Process Vehicle Return (Stored Procedure with Late Fee Calculation & Trigger)
app.post('/api/rentals/return', async (req, res) => {
    const { rentalId, endMileage, damageCost } = req.body;
    try {
        await db.execute('CALL ProcessVehicleReturn(?, ?, ?)', 
            [rentalId, endMileage || 0, damageCost || 0]);
        res.json({ success: true, message: 'Vehicle returned successfully. Status reset to Available.' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// Process Payment (Stored Procedure with Error Handling)
app.post('/api/payments/process', async (req, res) => {
    const { paymentId, method, amount } = req.body;
    try {
        await db.execute('CALL ProcessPayment(?, ?, ?)', [paymentId, method, amount]);
        res.json({ success: true, message: 'Payment completed successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// Process Refund (Stored Procedure)
app.post('/api/payments/refund', async (req, res) => {
    const { paymentId } = req.body;
    try {
        await db.execute('CALL ProcessRefund(?)', [paymentId]);
        res.json({ success: true, message: 'Payment refunded successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// ==========================================
// 5. MEMBER 5 (Maintenance, Branch & Reporting)
// ==========================================

// Get Vehicle Maintenance Records (View)
app.get('/api/maintenance', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM VehicleMaintenanceView ORDER BY MaintenanceID DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Add Maintenance Record (Stored Procedure with Trigger setting Status to In_Maintenance)
app.post('/api/maintenance', async (req, res) => {
    const { vehicleId, branchId, serviceDate, cost, description } = req.body;
    try {
        await db.execute('CALL AddMaintenanceRecord(?, ?, ?, ?, ?)', 
            [vehicleId, branchId, serviceDate, cost, description]);
        res.status(201).json({ success: true, message: 'Maintenance record scheduled successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// Update Maintenance Status (Stored Procedure with Trigger setting Status to Available upon completion)
app.put('/api/maintenance/:id/status', async (req, res) => {
    const maintenanceId = req.params.id;
    const { status } = req.body;
    try {
        await db.execute('CALL UpdateMaintenanceStatus(?, ?)', [maintenanceId, status]);
        res.json({ success: true, message: 'Maintenance status updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.sqlMessage || err.message });
    }
});

// Branch Performance View (View)
app.get('/api/reports/branch-performance', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM BranchPerformanceView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Generate Specific Branch Report (Stored Procedure)
app.get('/api/reports/branch/:branchId', async (req, res) => {
    const branchId = req.params.branchId;
    try {
        const [results] = await db.query('CALL GenerateBranchReport(?)', [branchId]);
        res.json(results[0] || []);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Maintenance Cost Summary (View)
app.get('/api/reports/maintenance-cost', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM MaintenanceCostView");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// ==========================================
// 6. GLOBAL DASHBOARD & AUDIT LOGS
// ==========================================

// Real-Time Audit Logs (Populated by DB Triggers)
app.get('/api/audit-logs', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM AuditLogs ORDER BY ActionTimestamp DESC LIMIT 50");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

// Aggregated Dashboard KPI Stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [customers] = await db.query("SELECT COUNT(*) as count FROM ActiveCustomerView");
        const [vehicles] = await db.query("SELECT COUNT(*) as count FROM AvailableVehiclesView");
        const [rentals] = await db.query("SELECT COUNT(*) as count FROM ActiveRentalsView");
        const [maintenance] = await db.query("SELECT COUNT(*) as count FROM VehicleMaintenanceView WHERE MaintenanceStatus = 'In_Progress'");
        const [revenue] = await db.query("SELECT IFNULL(SUM(Amount), 0) as total FROM Payments WHERE PaymentStatus = 'Completed'");
        
        res.json({
            customers: customers[0].count,
            vehicles: vehicles[0].count,
            rentals: rentals[0].count,
            maintenance: maintenance[0].count,
            totalRevenue: revenue[0].total
        });
    } catch (err) {
        res.status(500).json({ error: err.sqlMessage || err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
