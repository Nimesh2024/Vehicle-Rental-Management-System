import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Route Handlers (MVC)
import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import rentalRoutes from './routes/rental.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import reportRoutes from './routes/report.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

// Controllers for direct endpoints
import VehicleController from './controllers/vehicle.controller.js';
import PaymentController from './controllers/payment.controller.js';
import DashboardController from './controllers/dashboard.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// API Route Mounts (MVC)
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Direct utility endpoints aligned with frontend requests
app.get('/api/branches', VehicleController.getBranches);
app.get('/api/categories', VehicleController.getCategories);
app.get('/api/fines', PaymentController.getFines);
app.get('/api/audit-logs', DashboardController.getAuditLogs);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT} (ES Modules / MVC Architecture)`));
