USE VehicleRentalDB;

-- ==========================================
-- MEMBER 5: Maintenance, Branch & Reporting
-- ==========================================

-- 1. INDEXES
CREATE INDEX idx_maint_vehicle ON Maintenance(VehicleID);
CREATE INDEX idx_maint_date ON Maintenance(ServiceDate);
CREATE INDEX idx_maint_branch ON Maintenance(BranchID);
CREATE INDEX idx_maint_status ON Maintenance(MaintenanceStatus);

-- 2. VIEWS
CREATE OR REPLACE VIEW VehicleMaintenanceView AS
SELECT m.MaintenanceID, v.RegistrationNumber, b.BranchName, m.ServiceDate, m.Cost, m.MaintenanceStatus
FROM Maintenance m
JOIN Vehicles v ON m.VehicleID = v.VehicleID
JOIN Branches b ON m.BranchID = b.BranchID;

CREATE OR REPLACE VIEW BranchPerformanceView AS
SELECT b.BranchName, COUNT(bk.BookingID) AS TotalBookings, SUM(p.Amount) AS TotalRevenue
FROM Branches b
LEFT JOIN Vehicles v ON b.BranchID = v.BranchID
LEFT JOIN Bookings bk ON v.VehicleID = bk.VehicleID
LEFT JOIN Rentals r ON bk.BookingID = r.BookingID
LEFT JOIN Payments p ON r.RentalID = p.RentalID AND p.PaymentStatus = 'Completed'
GROUP BY b.BranchID;

CREATE OR REPLACE VIEW MaintenanceCostView AS
SELECT v.RegistrationNumber, SUM(m.Cost) AS TotalMaintenanceCost
FROM Vehicles v JOIN Maintenance m ON v.VehicleID = m.VehicleID
GROUP BY v.VehicleID;

-- 3. UDFs
DELIMITER //
CREATE FUNCTION CalculateMaintenanceCost(p_VehicleID INT) 
RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
    DECLARE v_Cost DECIMAL(10,2);
    SELECT SUM(Cost) INTO v_Cost FROM Maintenance WHERE VehicleID = p_VehicleID AND MaintenanceStatus = 'Completed';
    RETURN IFNULL(v_Cost, 0);
END //

CREATE FUNCTION CalculateVehicleUtilization(p_VehicleID INT) 
RETURNS DECIMAL(5,2) DETERMINISTIC
BEGIN
    DECLARE v_TotalDays INT;
    DECLARE v_RentedDays INT;
    
    SELECT DATEDIFF(CURDATE(), PurchaseDate) INTO v_TotalDays FROM Vehicles WHERE VehicleID = p_VehicleID;
    
    SELECT SUM(DATEDIFF(IFNULL(ActualEndDate, CURDATE()), ActualStartDate)) INTO v_RentedDays 
    FROM Rentals r JOIN Bookings b ON r.BookingID = b.BookingID WHERE b.VehicleID = p_VehicleID;
    
    IF v_TotalDays = 0 THEN RETURN 0; END IF;
    RETURN (IFNULL(v_RentedDays, 0) / v_TotalDays) * 100;
END //
DELIMITER ;

-- 4. STORED PROCEDURES
DELIMITER //
CREATE PROCEDURE AddMaintenanceRecord(
    IN p_VehicleID INT, IN p_BranchID INT, IN p_ServiceDate DATE, IN p_Cost DECIMAL(10,2), IN p_Desc TEXT
)
BEGIN
    DECLARE v_Count INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid vehicle or maintenance date.';
    END;

    IF p_Cost < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid maintenance cost.';
    END IF;
    
    START TRANSACTION;
    
    SELECT COUNT(*) INTO v_Count FROM Maintenance WHERE VehicleID = p_VehicleID AND ServiceDate = p_ServiceDate;
    IF v_Count > 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate maintenance record.';
    END IF;
    
    -- Maintenance creation triggers vehicle status update
    INSERT INTO Maintenance (VehicleID, BranchID, ServiceDate, Description, Cost, MaintenanceStatus)
    VALUES (p_VehicleID, p_BranchID, p_ServiceDate, p_Desc, p_Cost, 'Scheduled');
    
    COMMIT;
END //

CREATE PROCEDURE UpdateMaintenanceStatus(IN p_MaintenanceID INT, IN p_Status VARCHAR(50))
BEGIN
    START TRANSACTION;
    UPDATE Maintenance SET MaintenanceStatus = p_Status WHERE MaintenanceID = p_MaintenanceID;
    COMMIT;
END //

CREATE PROCEDURE GenerateBranchReport(IN p_BranchID INT)
BEGIN
    SELECT * FROM BranchPerformanceView WHERE BranchName = (SELECT BranchName FROM Branches WHERE BranchID = p_BranchID);
END //
DELIMITER ;

-- 5. TRIGGERS
DELIMITER //
CREATE TRIGGER ChangeVehToMaintenance
AFTER INSERT ON Maintenance
FOR EACH ROW
BEGIN
    -- Change vehicle status to MAINTENANCE
    UPDATE Vehicles SET Status = 'In_Maintenance' WHERE VehicleID = NEW.VehicleID;
END //

CREATE TRIGGER ChangeVehToAvailable
AFTER UPDATE ON Maintenance
FOR EACH ROW
BEGIN
    -- Change vehicle status back to AVAILABLE after maintenance
    IF NEW.MaintenanceStatus = 'Completed' AND OLD.MaintenanceStatus != 'Completed' THEN
        UPDATE Vehicles SET Status = 'Available', LastMaintenanceDate = CURDATE() WHERE VehicleID = NEW.VehicleID;
    END IF;
END //
DELIMITER ;

-- 6. EVENTS
DELIMITER //
CREATE EVENT GeneratePeriodicMaintenance
ON SCHEDULE EVERY 1 WEEK
DO
BEGIN
    -- Generate periodic maintenance checks for vehicles flagged due
    INSERT INTO Maintenance (VehicleID, BranchID, ServiceDate, Description, MaintenanceStatus)
    SELECT VehicleID, BranchID, CURDATE() + INTERVAL 2 DAY, 'Periodic Maintenance Check', 'Scheduled'
    FROM Vehicles WHERE Status = 'Maintenance_Required';
END //
DELIMITER ;
