CREATE DATABASE IF NOT EXISTS VehicleRentalDB;
USE VehicleRentalDB;

-- ==========================================
-- MAIN SCHEMA (15 Normalized Tables)
-- ==========================================

CREATE TABLE Roles (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleID INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

CREATE TABLE Branches (
    BranchID INT AUTO_INCREMENT PRIMARY KEY,
    BranchName VARCHAR(100) NOT NULL,
    Location VARCHAR(255) NOT NULL,
    ContactNumber VARCHAR(15) NOT NULL
);

CREATE TABLE Customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    NIC_Passport VARCHAR(50) NOT NULL UNIQUE,
    DOB DATE NOT NULL,
    Phone VARCHAR(15) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Address VARCHAR(255),
    Status ENUM('Active', 'Inactive', 'Blacklisted') DEFAULT 'Active',
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Employees (
    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    BranchID INT NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    HireDate DATE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (BranchID) REFERENCES Branches(BranchID)
);

CREATE TABLE AuditLogs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    ActionType VARCHAR(50) NOT NULL,
    TableName VARCHAR(50) NOT NULL,
    RecordID INT,
    ActionTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Description TEXT
);

CREATE TABLE VehicleCategories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(50) NOT NULL UNIQUE,
    DailyRate DECIMAL(10,2) NOT NULL CHECK (DailyRate > 0)
);

CREATE TABLE Vehicles (
    VehicleID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryID INT NOT NULL,
    BranchID INT NOT NULL,
    Make VARCHAR(50) NOT NULL,
    Model VARCHAR(50) NOT NULL,
    Year INT NOT NULL,
    RegistrationNumber VARCHAR(20) NOT NULL UNIQUE,
    PurchaseDate DATE NOT NULL,
    CurrentMileage INT NOT NULL DEFAULT 0 CHECK (CurrentMileage >= 0),
    Status ENUM('Available', 'Rented', 'Maintenance_Required', 'In_Maintenance', 'Out_Of_Service') DEFAULT 'Available',
    LastMaintenanceDate DATE,
    FOREIGN KEY (CategoryID) REFERENCES VehicleCategories(CategoryID),
    FOREIGN KEY (BranchID) REFERENCES Branches(BranchID)
);

CREATE TABLE VehicleStatusHistory (
    HistoryID INT AUTO_INCREMENT PRIMARY KEY,
    VehicleID INT NOT NULL,
    OldStatus VARCHAR(50),
    NewStatus VARCHAR(50) NOT NULL,
    ChangedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID)
);

CREATE TABLE Bookings (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    VehicleID INT NOT NULL,
    BookingDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') DEFAULT 'Pending',
    CHECK (EndDate >= StartDate),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID)
);

CREATE TABLE Rentals (
    RentalID INT AUTO_INCREMENT PRIMARY KEY,
    BookingID INT NOT NULL UNIQUE,
    RentalDate DATE NOT NULL,
    ActualStartDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ActualEndDate TIMESTAMP NULL,
    StartMileage INT NOT NULL,
    EndMileage INT,
    RentalStatus ENUM('Ongoing', 'Completed', 'Overdue', 'Cancelled') DEFAULT 'Ongoing',
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID)
);

CREATE TABLE Payments (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    RentalID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL CHECK (Amount >= 0),
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PaymentMethod ENUM('Credit Card', 'Cash', 'Bank Transfer', 'Unpaid') DEFAULT 'Unpaid',
    PaymentStatus ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    FOREIGN KEY (RentalID) REFERENCES Rentals(RentalID)
);

CREATE TABLE Fines (
    FineID INT AUTO_INCREMENT PRIMARY KEY,
    RentalID INT NOT NULL,
    FineType ENUM('Late Return', 'Damage', 'Traffic Violation', 'Other') NOT NULL,
    Amount DECIMAL(10,2) NOT NULL CHECK (Amount > 0),
    Description TEXT,
    Status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    FOREIGN KEY (RentalID) REFERENCES Rentals(RentalID)
);

CREATE TABLE Maintenance (
    MaintenanceID INT AUTO_INCREMENT PRIMARY KEY,
    VehicleID INT NOT NULL,
    BranchID INT NOT NULL,
    ServiceDate DATE NOT NULL,
    Description TEXT,
    Cost DECIMAL(10,2) CHECK (Cost >= 0),
    MaintenanceStatus ENUM('Scheduled', 'In_Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID),
    FOREIGN KEY (BranchID) REFERENCES Branches(BranchID)
);

CREATE TABLE BranchTransfers (
    TransferID INT AUTO_INCREMENT PRIMARY KEY,
    VehicleID INT NOT NULL,
    FromBranchID INT NOT NULL,
    ToBranchID INT NOT NULL,
    TransferDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID),
    FOREIGN KEY (FromBranchID) REFERENCES Branches(BranchID),
    FOREIGN KEY (ToBranchID) REFERENCES Branches(BranchID)
);
