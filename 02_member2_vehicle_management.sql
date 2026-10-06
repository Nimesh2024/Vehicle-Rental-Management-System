USE VehicleRentalDB;

-- ==========================================
-- MEMBER 2: Vehicle Management
-- ==========================================

-- 1. INDEXES
CREATE INDEX idx_veh_reg ON Vehicles(RegistrationNumber);
CREATE INDEX idx_veh_cat ON Vehicles(CategoryID);
CREATE INDEX idx_veh_status ON Vehicles(Status);

-- 2. VIEWS
CREATE OR REPLACE VIEW AvailableVehiclesView AS
SELECT v.VehicleID, v.RegistrationNumber, v.Make, v.Model, c.CategoryName, c.DailyRate, v.Status
FROM Vehicles v
JOIN VehicleCategories c ON v.CategoryID = c.CategoryID
WHERE v.Status = 'Available';

CREATE OR REPLACE VIEW BranchVehicleView AS
SELECT b.BranchName, v.RegistrationNumber, v.Make, v.Model, v.Status
FROM Vehicles v
JOIN Branches b ON v.BranchID = b.BranchID;

-- 3. UDFs
DELIMITER //
CREATE FUNCTION VehicleAge(p_PurchaseDate DATE) 
RETURNS INT DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, p_PurchaseDate, CURDATE());
END //

CREATE FUNCTION CalculateVehicleRentalRate(p_VehicleID INT) 
RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
    DECLARE v_Rate DECIMAL(10,2);
    SELECT c.DailyRate INTO v_Rate FROM Vehicles v JOIN VehicleCategories c ON v.CategoryID = c.CategoryID WHERE v.VehicleID = p_VehicleID;
    RETURN v_Rate;
END //
DELIMITER ;

-- 4. STORED PROCEDURES
DELIMITER //
CREATE PROCEDURE AddVehicle(
    IN p_CategoryID INT, IN p_BranchID INT, IN p_Make VARCHAR(50), IN p_Model VARCHAR(50), 
    IN p_Year INT, IN p_Registration VARCHAR(20), IN p_PurchaseDate DATE
)
BEGIN
    -- Error Handling
    DECLARE EXIT HANDLER FOR 1062
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate registration number.';
    END;
    
    DECLARE EXIT HANDLER FOR 1452 -- Foreign Key constraint fails
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid vehicle category.';
    END;

    START TRANSACTION;
    -- Add vehicle + branch allocation handled by BranchID insertion
    INSERT INTO Vehicles (CategoryID, BranchID, Make, Model, Year, RegistrationNumber, PurchaseDate)
    VALUES (p_CategoryID, p_BranchID, p_Make, p_Model, p_Year, p_Registration, p_PurchaseDate);
    COMMIT;
END //

CREATE PROCEDURE UpdateVehicleStatus(
    IN p_VehicleID INT, IN p_NewStatus VARCHAR(50)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error updating vehicle status.';
    END;

    IF p_NewStatus NOT IN ('Available', 'Rented', 'Maintenance_Required', 'In_Maintenance', 'Out_Of_Service') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid vehicle status.';
    END IF;

    START TRANSACTION;
    UPDATE Vehicles SET Status = p_NewStatus WHERE VehicleID = p_VehicleID;
    COMMIT;
END //
DELIMITER ;

-- 5. TRIGGERS
DELIMITER //
CREATE TRIGGER AutoVehicleStatusLog
AFTER UPDATE ON Vehicles
FOR EACH ROW
BEGIN
    IF OLD.Status != NEW.Status THEN
        INSERT INTO VehicleStatusHistory (VehicleID, OldStatus, NewStatus)
        VALUES (NEW.VehicleID, OLD.Status, NEW.Status);
    END IF;
END //

CREATE TRIGGER VehicleAuditLog
AFTER INSERT ON Vehicles
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description)
    VALUES ('INSERT', 'Vehicles', NEW.VehicleID, CONCAT('Added Vehicle: ', NEW.RegistrationNumber));
END //
DELIMITER ;

-- 6. EVENTS
DELIMITER //
CREATE EVENT IdentifyMaintenanceVehicles
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    -- Identify vehicles requiring maintenance (Status Update)
    UPDATE Vehicles 
    SET Status = 'Maintenance_Required' 
    WHERE Status = 'Available' AND CurrentMileage >= 10000 AND (LastMaintenanceDate IS NULL OR DATEDIFF(CURDATE(), LastMaintenanceDate) > 180);
END //
DELIMITER ;
