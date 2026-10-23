USE VehicleRentalDB;

-- ====================================================
-- VEHICLE RENTAL MANAGEMENT SYSTEM - COMPREHENSIVE SEED DATA
-- Fully supports all 4 Branches, Predefined Branch Managers,
-- 1 System Admin, Curated Customers, and a 24-Vehicle Fleet
-- All users share password: password123
-- ====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data
TRUNCATE TABLE AuditLogs;
TRUNCATE TABLE BranchTransfers;
TRUNCATE TABLE Maintenance;
TRUNCATE TABLE Fines;
TRUNCATE TABLE Payments;
TRUNCATE TABLE Rentals;
TRUNCATE TABLE Bookings;
TRUNCATE TABLE VehicleStatusHistory;
TRUNCATE TABLE Vehicles;
TRUNCATE TABLE VehicleCategories;
TRUNCATE TABLE Employees;
TRUNCATE TABLE Customers;
TRUNCATE TABLE Users;
TRUNCATE TABLE Branches;
TRUNCATE TABLE Roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------
-- 1. SYSTEM ROLES
-- ----------------------------------------------------
INSERT INTO Roles (RoleID, RoleName) VALUES
(1, 'Admin'),
(2, 'Branch Manager'),
(3, 'Rental Staff'),
(4, 'Customer');

-- ----------------------------------------------------
-- 2. OPERATING BRANCHES (All 4 Core Regional Hubs)
-- ----------------------------------------------------
INSERT INTO Branches (BranchID, BranchName, Location, ContactNumber) VALUES
(1, 'Colombo City Hub', 'No. 45 Galle Road, Colombo 03', '+94112345670'),
(2, 'Kandy Central Branch', 'No. 12 Dalada Veediya, Kandy', '+94812233440'),
(3, 'Galle Fort Branch', 'No. 88 Rampart Street, Galle', '+94912255660'),
(4, 'Negombo Airport Branch', 'No. 15 Airport Road, Katunayake', '+94312277880');

-- ----------------------------------------------------
-- 3. VEHICLE CATEGORIES (Daily Rates in LKR)
-- ----------------------------------------------------
INSERT INTO VehicleCategories (CategoryID, CategoryName, DailyRate) VALUES
(1, 'Economy Hatchback', 8500.00),
(2, 'Standard Sedan', 14000.00),
(3, 'Compact SUV', 22000.00),
(4, 'Luxury Sedan', 45000.00),
(5, 'Premium SUV', 65000.00),
(6, 'Passenger Van', 28000.00);

-- ----------------------------------------------------
-- 4. SYSTEM USERS (Admin, 4 Branch Managers, 2 Staff, 5 Customers)
-- Standard bcrypt hash for 'password123'
-- ($2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G)
-- ----------------------------------------------------
INSERT INTO Users (UserID, Username, PasswordHash, RoleID) VALUES
-- 1 Admin
(1, 'admin', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 1),

-- 4 Predefined Branch Managers (1 for each operating branch)
(2, 'manager_colombo', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 2),
(3, 'manager_kandy', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 2),
(4, 'manager_galle', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 2),
(5, 'manager_negombo', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 2),

-- 2 Operational Rental Staff
(6, 'staff_colombo', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 3),
(7, 'staff_kandy', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 3),

-- 5 Curated Representative Customers
(8, 'customer', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(9, 'sunil_perera', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(10, 'kasun_fernando', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(11, 'dilani_silva', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(12, 'anura_kumara', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4);

-- ----------------------------------------------------
-- 5. EMPLOYEES (Managers & Staff assigned to Branches)
-- ----------------------------------------------------
INSERT INTO Employees (EmployeeID, UserID, BranchID, FirstName, LastName, HireDate, Phone, Email) VALUES
-- Branch Managers
(1, 2, 1, 'Kamal', 'Gunaratne', '2023-01-15', '+94771122334', 'kamal.mgr@rento.lk'),
(2, 3, 2, 'Nimal', 'Sirisena', '2023-03-10', '+94772233445', 'nimal.mgr@rento.lk'),
(3, 4, 3, 'Rohan', 'De Silva', '2023-05-20', '+94773344556', 'rohan.mgr@rento.lk'),
(4, 5, 4, 'Asela', 'Fernando', '2023-08-01', '+94774455667', 'asela.mgr@rento.lk'),
-- Rental Staff
(5, 6, 1, 'Dinesh', 'Perera', '2024-01-10', '+94775566778', 'dinesh.staff@rento.lk'),
(6, 7, 2, 'Nuwan', 'Pradeep', '2024-02-15', '+94776677889', 'nuwan.staff@rento.lk');

-- ----------------------------------------------------
-- 6. CUSTOMERS (Active Client Accounts)
-- ----------------------------------------------------
INSERT INTO Customers (CustomerID, UserID, FirstName, LastName, NIC_Passport, DOB, Phone, Email, Address, Status) VALUES
(1, 8, 'Ravindu', 'Sandaruwan', '199512345678', '1995-04-12', '+94771234567', 'ravindu.s@gmail.com', '14 Havelock Rd, Colombo 05', 'Active'),
(2, 9, 'Sunil', 'Perera', '198823456789', '1988-08-25', '+94712345678', 'sunil.p@gmail.com', '82 Peradeniya Rd, Kandy', 'Active'),
(3, 10, 'Kasun', 'Fernando', '199234567890', '1992-11-03', '+94763456789', 'kasun.f@yahoo.com', '45 Matara Rd, Galle', 'Active'),
(4, 11, 'Dilani', 'Silva', '199645678901', '1996-02-19', '+94784567890', 'dilani.s@outlook.com', '29 Main St, Negombo', 'Active'),
(5, 12, 'Anura', 'Kumara', '198356789012', '1983-09-15', '+94725678901', 'anura.k@gmail.com', '12 Lake View, Kandy', 'Active');

-- ----------------------------------------------------
-- 7. VEHICLES FLEET (24 Cars - 6 per Branch across all Categories)
-- ----------------------------------------------------
INSERT INTO Vehicles (VehicleID, CategoryID, BranchID, Make, Model, Year, RegistrationNumber, PurchaseDate, CurrentMileage, Status, LastMaintenanceDate) VALUES
-- Branch 1: Colombo City Hub (6 Vehicles)
(1, 1, 1, 'Suzuki', 'Alto K10', 2022, 'CBA-1020', '2022-03-10', 18500, 'Available', '2026-08-15'),
(2, 1, 1, 'Toyota', 'Vitz', 2021, 'CAB-4521', '2021-07-22', 32000, 'Available', '2026-07-10'),
(3, 2, 1, 'Toyota', 'Corolla Axio', 2022, 'CBB-8890', '2022-01-18', 24500, 'Available', '2026-09-01'),
(4, 3, 1, 'Honda', 'Vezel RS', 2023, 'WP CAJ-1290', '2023-04-10', 14200, 'Available', '2026-08-10'),
(5, 4, 1, 'Mercedes-Benz', 'C200 AMG', 2023, 'CBF-9900', '2023-11-01', 8500, 'Rented', '2026-08-01'),
(6, 6, 1, 'Toyota', 'HiAce KDH Super GL', 2022, 'WP CBK-3344', '2022-02-15', 38000, 'Available', '2026-07-20'),

-- Branch 2: Kandy Central Branch (6 Vehicles)
(7, 1, 2, 'Suzuki', 'Wagon R FX', 2022, 'CP KX-8812', '2022-05-18', 21000, 'Available', '2026-08-05'),
(8, 2, 2, 'Honda', 'Civic RS Turbo', 2023, 'CBC-3344', '2023-05-12', 15200, 'Available', '2026-09-20'),
(9, 2, 2, 'Toyota', 'Premio 260', 2021, 'CP CAY-9901', '2021-09-12', 29000, 'Available', '2026-08-12'),
(10, 3, 2, 'Toyota', 'Raize Turbo', 2023, 'CP CBZ-7711', '2023-03-25', 11000, 'Available', '2026-09-15'),
(11, 4, 2, 'BMW', '520d Luxury Line', 2022, 'CBG-5566', '2022-06-15', 18200, 'In_Maintenance', '2026-10-05'),
(12, 5, 2, 'Toyota', 'Land Cruiser Prado TX', 2023, 'CP CBX-2210', '2023-06-10', 16500, 'Available', '2026-09-10'),

-- Branch 3: Galle Fort Branch (6 Vehicles)
(13, 1, 3, 'Daihatsu', 'Mira e:S', 2022, 'SP CAA-4590', '2022-08-14', 19000, 'Available', '2026-08-20'),
(14, 2, 3, 'Toyota', 'Allion A15', 2021, 'SP CBQ-1120', '2021-11-20', 34000, 'Available', '2026-07-15'),
(15, 3, 3, 'Nissan', 'X-Trail Hybrid', 2022, 'CBD-7711', '2022-09-05', 29000, 'Available', '2026-08-25'),
(16, 3, 3, 'Hyundai', 'Tucson', 2023, 'CBE-1122', '2023-02-14', 19800, 'Available', '2026-07-30'),
(17, 4, 3, 'Audi', 'A6 Matrix', 2023, 'SP CBW-9009', '2023-05-18', 9200, 'Available', '2026-09-05'),
(18, 6, 3, 'Toyota', 'HiAce Commuter Van', 2021, 'SP NA-4411', '2021-08-22', 49000, 'Available', '2026-06-18'),

-- Branch 4: Negombo Airport Branch (6 Vehicles)
(19, 1, 4, 'Toyota', 'Aqua Hybrid', 2022, 'WP CAG-6622', '2022-04-15', 26000, 'Available', '2026-08-18'),
(20, 2, 4, 'Mazda', '3 SkyActiv', 2022, 'NW PH-7788', '2022-10-10', 22000, 'Available', '2026-09-08'),
(21, 3, 4, 'Kia', 'Sportage GT-Line', 2023, 'WP CBR-5500', '2023-01-20', 14500, 'Available', '2026-08-28'),
(22, 5, 4, 'Toyota', 'Land Cruiser Prado', 2023, 'CBH-4455', '2023-04-10', 22000, 'Rented', '2026-09-12'),
(23, 5, 4, 'Mitsubishi', 'Montero V98', 2022, 'WP CBS-8811', '2022-07-30', 27500, 'Available', '2026-08-14'),
(24, 6, 4, 'Toyota', 'HiAce KDH', 2021, 'NB-6677', '2021-10-05', 45000, 'Maintenance_Required', '2026-05-20');

-- ----------------------------------------------------
-- 8. BOOKINGS (With Mandatory Online Advance Security Deposits)
-- ----------------------------------------------------
INSERT INTO Bookings (BookingID, CustomerID, VehicleID, BookingDate, StartDate, EndDate, Status, DepositAmount, DepositStatus, DepositPaymentMethod) VALUES
(1, 1, 1, '2026-09-01 10:00:00', '2026-09-02', '2026-09-05', 'Completed', 15000.00, 'Paid', 'Credit Card'),
(2, 2, 8, '2026-09-10 11:30:00', '2026-09-12', '2026-09-15', 'Completed', 25000.00, 'Paid', 'Credit Card'),
(3, 3, 15, '2026-09-20 09:15:00', '2026-09-21', '2026-09-24', 'Completed', 35000.00, 'Paid', 'Credit Card'),
(4, 4, 5, '2026-10-01 14:00:00', '2026-10-02', '2026-10-08', 'Completed', 50000.00, 'Paid', 'Credit Card'),
(5, 5, 22, '2026-10-03 16:45:00', '2026-10-04', '2026-10-10', 'Completed', 50000.00, 'Paid', 'Credit Card'),
(6, 1, 3, '2026-10-20 18:00:00', '2026-11-20', '2026-11-23', 'Confirmed', 25000.00, 'Paid', 'Credit Card'),
(7, 2, 4, '2026-10-21 12:00:00', '2026-11-10', '2026-11-14', 'Confirmed', 35000.00, 'Paid', 'Credit Card');

-- ----------------------------------------------------
-- 9. RENTALS (Dispatched Check-outs & History)
-- ----------------------------------------------------
INSERT INTO Rentals (RentalID, BookingID, RentalDate, ActualStartDate, ActualEndDate, StartMileage, EndMileage, RentalStatus) VALUES
(1, 1, '2026-09-02', '2026-09-02 09:00:00', '2026-09-05 17:00:00', 18000, 18500, 'Completed'),
(2, 2, '2026-09-12', '2026-09-12 10:00:00', '2026-09-15 18:30:00', 14700, 15200, 'Completed'),
(3, 3, '2026-09-21', '2026-09-21 08:30:00', '2026-09-24 16:00:00', 28500, 29000, 'Completed'),
(4, 4, '2026-10-02', '2026-10-02 11:00:00', NULL, 8500, NULL, 'Ongoing'),
(5, 5, '2026-10-04', '2026-10-04 09:30:00', NULL, 22000, NULL, 'Ongoing');

-- ----------------------------------------------------
-- 10. PAYMENTS (In LKR)
-- ----------------------------------------------------
INSERT INTO Payments (PaymentID, RentalID, Amount, PaymentDate, PaymentMethod, PaymentStatus) VALUES
(1, 1, 25500.00, '2026-09-02 09:15:00', 'Credit Card', 'Completed'),
(2, 2, 42000.00, '2026-09-12 10:15:00', 'Bank Transfer', 'Completed'),
(3, 3, 66000.00, '2026-09-21 08:45:00', 'Cash', 'Completed'),
(4, 4, 270000.00, '2026-10-02 11:10:00', 'Credit Card', 'Completed'),
(5, 5, 390000.00, '2026-10-04 09:40:00', 'Unpaid', 'Pending');

-- ----------------------------------------------------
-- 11. FINES (Late Return & Damage in LKR)
-- ----------------------------------------------------
INSERT INTO Fines (FineID, RentalID, FineType, Amount, Description, Status) VALUES
(1, 1, 'Late Return', 12500.00, 'Returned 1 hour late beyond grace period', 'Paid'),
(2, 2, 'Damage', 35000.00, 'Minor bumper scratch on rear left corner', 'Unpaid');

-- ----------------------------------------------------
-- 12. MAINTENANCE TICKETS (Across Branches)
-- ----------------------------------------------------
INSERT INTO Maintenance (MaintenanceID, VehicleID, BranchID, ServiceDate, Description, Cost, MaintenanceStatus) VALUES
(1, 1, 1, '2026-08-15', 'Regular 15,000km Engine Oil and Filter Change', 18500.00, 'Completed'),
(2, 8, 2, '2026-09-01', 'Brake Pad Replacement & Wheel Alignment', 34000.00, 'Completed'),
(3, 11, 2, '2026-10-05', 'Transmission System Inspection & Sensor Check', 85000.00, 'In_Progress'),
(4, 24, 4, '2026-10-15', 'Scheduled 50,000km Major Periodic Service', 65000.00, 'Scheduled');

-- ----------------------------------------------------
-- 13. BRANCH TRANSFERS
-- ----------------------------------------------------
INSERT INTO BranchTransfers (TransferID, VehicleID, FromBranchID, ToBranchID, TransferDate, Status) VALUES
(1, 4, 1, 2, '2026-08-20 14:30:00', 'Completed'),
(2, 16, 2, 3, '2026-09-15 09:00:00', 'Completed');

-- ----------------------------------------------------
-- 14. SYNC VEHICLE STATUSES ACCORDING TO RENTALS & MAINTENANCE
-- ----------------------------------------------------
UPDATE Vehicles SET Status = 'Rented' WHERE VehicleID IN (5, 22);
UPDATE Vehicles SET Status = 'In_Maintenance' WHERE VehicleID = 11;
UPDATE Vehicles SET Status = 'Maintenance_Required' WHERE VehicleID = 24;
UPDATE Vehicles SET Status = 'Available' WHERE VehicleID NOT IN (5, 11, 22, 24);
