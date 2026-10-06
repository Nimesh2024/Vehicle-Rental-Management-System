USE VehicleRentalDB;

-- ==========================================
-- 06_SEED_DATA.SQL
-- Comprehensive Sample Dataset for DBMS Project
-- ==========================================

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
-- 1. ROLES
-- ----------------------------------------------------
INSERT INTO Roles (RoleID, RoleName) VALUES
(1, 'Admin'),
(2, 'Branch Manager'),
(3, 'Rental Staff'),
(4, 'Customer');

-- ----------------------------------------------------
-- 2. BRANCHES
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
-- 4. USERS (Admin, Staff & Customers)
-- Password hash sample: SHA-256 for 'password123'
-- ----------------------------------------------------
INSERT INTO Users (UserID, Username, PasswordHash, RoleID) VALUES
(1, 'admin_super', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 1),
(2, 'kamal_mgr', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 2),
(3, 'nimal_staff', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 3),
(4, 'sunil_perera', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(5, 'anura_kumara', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(6, 'chamari_atapa', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(7, 'dilshan_jaya', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(8, 'lasith_mal', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(9, 'kumar_sanga', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4),
(10, 'mahela_jaya', '$2b$10$wT8KzQ8V4YvY4bK.v3H5quN6J6a4F2OaN67gYyR/sFh7aC9F5/W1G', 4);

-- ----------------------------------------------------
-- 5. EMPLOYEES
-- ----------------------------------------------------
INSERT INTO Employees (EmployeeID, UserID, BranchID, FirstName, LastName, HireDate) VALUES
(1, 2, 1, 'Kamal', 'Gunaratne', '2023-01-15'),
(2, 3, 2, 'Nimal', 'Sirisena', '2023-06-01');

-- ----------------------------------------------------
-- 6. CUSTOMERS (Member 1 Module Data)
-- ----------------------------------------------------
INSERT INTO Customers (CustomerID, UserID, FirstName, LastName, NIC_Passport, DOB, Phone, Email, Address, Status) VALUES
(1, 4, 'Sunil', 'Perera', '198512345678', '1985-05-14', '+94771234567', 'sunil.p@gmail.com', '12 Flower Rd, Colombo 07', 'Active'),
(2, 5, 'Anura', 'Kumara', '199023456789', '1990-09-20', '+94712345678', 'anura.k@yahoo.com', '45 Hill Street, Kandy', 'Active'),
(3, 6, 'Chamari', 'Athapaththu', '199234567890', '1992-02-09', '+94763456789', 'chamari.a@outlook.com', '77 Beach Rd, Galle', 'Active'),
(4, 7, 'Dilshan', 'Jayawardena', '198845678901', '1988-11-30', '+94784567890', 'dilshan.j@gmail.com', '10 Temple Rd, Negombo', 'Active'),
(5, 8, 'Lasith', 'Malinga', '198356789012', '1983-08-28', '+94725678901', 'lasith.m@gmail.com', '33 Coastal Ave, Rathgama', 'Active'),
(6, 9, 'Kumar', 'Sangakkara', '197767890123', '1977-10-27', '+94756789012', 'kumar.s@srilanka.lk', '99 Lake View, Kandy', 'Active'),
(7, 10, 'Mahela', 'Jayawardene', '197778901234', '1977-05-27', '+94707890123', 'mahela.j@cricket.lk', '54 Union Place, Colombo 02', 'Inactive');

-- ----------------------------------------------------
-- 7. VEHICLES (Member 2 Module Data)
-- ----------------------------------------------------
INSERT INTO Vehicles (VehicleID, CategoryID, BranchID, Make, Model, Year, RegistrationNumber, PurchaseDate, CurrentMileage, Status, LastMaintenanceDate) VALUES
(1, 1, 1, 'Suzuki', 'Alto K10', 2022, 'CBA-1020', '2022-03-10', 18500, 'Available', '2026-08-15'),
(2, 1, 1, 'Toyota', 'Vitz', 2021, 'CAB-4521', '2021-07-22', 32000, 'Available', '2026-07-10'),
(3, 2, 2, 'Toyota', 'Corolla Axio', 2022, 'CBB-8890', '2022-01-18', 24500, 'Available', '2026-09-01'),
(4, 2, 2, 'Honda', 'Civic RS', 2023, 'CBC-3344', '2023-05-12', 15200, 'Available', '2026-09-20'),
(5, 3, 3, 'Nissan', 'X-Trail Hybrid', 2022, 'CBD-7711', '2022-09-05', 29000, 'Available', '2026-08-25'),
(6, 3, 3, 'Hyundai', 'Tucson', 2023, 'CBE-1122', '2023-02-14', 19800, 'Available', '2026-07-30'),
(7, 4, 1, 'Mercedes-Benz', 'C200 AMG', 2023, 'CBF-9900', '2023-11-01', 8500, 'Available', '2026-08-01'),
(8, 4, 1, 'BMW', '520d Luxury Line', 2022, 'CBG-5566', '2022-06-15', 18200, 'Available', '2026-06-10'),
(9, 5, 4, 'Toyota', 'Land Cruiser Prado', 2023, 'CBH-4455', '2023-04-10', 22000, 'Available', '2026-09-12'),
(10, 6, 4, 'Toyota', 'HiAce KDH', 2021, 'NB-6677', '2021-10-05', 45000, 'Available', '2026-05-20');

-- ----------------------------------------------------
-- 8. BOOKINGS (Member 3 Module Data)
-- ----------------------------------------------------
INSERT INTO Bookings (BookingID, CustomerID, VehicleID, BookingDate, StartDate, EndDate, Status) VALUES
(1, 1, 1, '2026-09-01 10:00:00', '2026-09-02', '2026-09-05', 'Completed'),
(2, 2, 3, '2026-09-10 11:30:00', '2026-09-12', '2026-09-15', 'Completed'),
(3, 3, 5, '2026-09-20 09:15:00', '2026-09-21', '2026-09-24', 'Completed'),
(4, 4, 7, '2026-10-01 14:00:00', '2026-10-02', '2026-10-08', 'Confirmed'),
(5, 5, 9, '2026-10-03 16:45:00', '2026-10-04', '2026-10-10', 'Confirmed'),
(6, 6, 2, '2026-10-05 08:30:00', '2026-10-07', '2026-10-12', 'Pending');

-- ----------------------------------------------------
-- 9. RENTALS (Member 3 & 4 Module Data)
-- ----------------------------------------------------
INSERT INTO Rentals (RentalID, BookingID, RentalDate, ActualStartDate, ActualEndDate, StartMileage, EndMileage, RentalStatus) VALUES
(1, 1, '2026-09-02', '2026-09-02 09:00:00', '2026-09-05 17:00:00', 18000, 18500, 'Completed'),
(2, 2, '2026-09-12', '2026-09-12 10:00:00', '2026-09-15 18:30:00', 24000, 24500, 'Completed'),
(3, 3, '2026-09-21', '2026-09-21 08:30:00', '2026-09-24 16:00:00', 28500, 29000, 'Completed'),
(4, 4, '2026-10-02', '2026-10-02 11:00:00', NULL, 8500, NULL, 'Ongoing'),
(5, 5, '2026-10-04', '2026-10-04 09:30:00', NULL, 22000, NULL, 'Ongoing');

-- ----------------------------------------------------
-- 10. PAYMENTS (Member 4 Module Data in LKR)
-- ----------------------------------------------------
INSERT INTO Payments (PaymentID, RentalID, Amount, PaymentDate, PaymentMethod, PaymentStatus) VALUES
(1, 1, 25500.00, '2026-09-02 09:15:00', 'Credit Card', 'Completed'),
(2, 2, 42000.00, '2026-09-12 10:15:00', 'Bank Transfer', 'Completed'),
(3, 3, 66000.00, '2026-09-21 08:45:00', 'Cash', 'Completed'),
(4, 4, 270000.00, '2026-10-02 11:10:00', 'Credit Card', 'Completed'),
(5, 5, 390000.00, '2026-10-04 09:40:00', 'Unpaid', 'Pending');

-- ----------------------------------------------------
-- 11. FINES (Member 4 Module Data in LKR)
-- ----------------------------------------------------
INSERT INTO Fines (FineID, RentalID, FineType, Amount, Description, Status) VALUES
(1, 1, 'Late Return', 12500.00, 'Returned 1 hour late beyond grace period', 'Paid'),
(2, 2, 'Damage', 35000.00, 'Minor bumper scratch on rear left corner', 'Unpaid');

-- ----------------------------------------------------
-- 12. MAINTENANCE (Member 5 Module Data in LKR)
-- ----------------------------------------------------
INSERT INTO Maintenance (MaintenanceID, VehicleID, BranchID, ServiceDate, Description, Cost, MaintenanceStatus) VALUES
(1, 1, 1, '2026-08-15', 'Regular 15,000km Engine Oil and Filter Change', 18500.00, 'Completed'),
(2, 3, 2, '2026-09-01', 'Brake Pad Replacement & Wheel Alignment', 34000.00, 'Completed'),
(3, 8, 1, '2026-10-05', 'Transmission System Inspection & Sensor Check', 85000.00, 'In_Progress'),
(4, 10, 4, '2026-10-15', 'Scheduled 50,000km Major Periodic Service', 65000.00, 'Scheduled');

-- ----------------------------------------------------
-- 13. BRANCH TRANSFERS (Optional Fleet Log)
-- ----------------------------------------------------
INSERT INTO BranchTransfers (TransferID, VehicleID, FromBranchID, ToBranchID, TransferDate, Status) VALUES
(1, 4, 1, 2, '2026-08-20 14:30:00', 'Completed'),
(2, 6, 2, 3, '2026-09-15 09:00:00', 'Completed');

-- ----------------------------------------------------
-- 14. SYNC VEHICLE STATUSES (Ensuring accurate fleet state)
-- ----------------------------------------------------
UPDATE Vehicles SET Status = 'Available' WHERE VehicleID IN (1, 2, 3, 5, 6, 10);
UPDATE Vehicles SET Status = 'Rented' WHERE VehicleID IN (7, 9);
UPDATE Vehicles SET Status = 'In_Maintenance' WHERE VehicleID = 8;
UPDATE Vehicles SET Status = 'Maintenance_Required' WHERE VehicleID = 10;
