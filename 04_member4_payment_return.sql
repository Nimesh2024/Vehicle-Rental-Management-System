USE VehicleRentalDB;

-- ==========================================
-- MEMBER 4: Payment, Return & Fine Management
-- ==========================================

-- 1. INDEXES
CREATE INDEX idx_payment_id ON Payments(PaymentID);
CREATE INDEX idx_payment_rental ON Payments(RentalID);
CREATE INDEX idx_payment_date ON Payments(PaymentDate);
CREATE INDEX idx_payment_status ON Payments(PaymentStatus);

-- 2. VIEWS
CREATE OR REPLACE VIEW PaymentSummaryView AS
SELECT PaymentMethod, COUNT(PaymentID) AS TotalTransactions, SUM(Amount) AS TotalRevenue
FROM Payments WHERE PaymentStatus = 'Completed' GROUP BY PaymentMethod;

CREATE OR REPLACE VIEW OutstandingPaymentView AS
SELECT p.PaymentID, c.FirstName, c.LastName, p.Amount, p.PaymentDate
FROM Payments p
JOIN Rentals r ON p.RentalID = r.RentalID JOIN Bookings b ON r.BookingID = b.BookingID JOIN Customers c ON b.CustomerID = c.CustomerID
WHERE p.PaymentStatus = 'Pending';

CREATE OR REPLACE VIEW CustomerFineView AS
SELECT c.FirstName, c.LastName, f.FineType, f.Amount, f.Status
FROM Fines f JOIN Rentals r ON f.RentalID = r.RentalID JOIN Bookings b ON r.BookingID = b.BookingID JOIN Customers c ON b.CustomerID = c.CustomerID;

-- 3. UDFs
DELIMITER //
CREATE FUNCTION CalculateLateDays(p_ExpectedEnd DATE, p_ActualEnd DATE) 
RETURNS INT DETERMINISTIC
BEGIN
    RETURN GREATEST(DATEDIFF(p_ActualEnd, p_ExpectedEnd), 0);
END //

CREATE FUNCTION CalculateFine(p_LateDays INT, p_DailyRate DECIMAL(10,2)) 
RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
    RETURN p_LateDays * (p_DailyRate * 1.5);
END //

CREATE FUNCTION CalculateFinalBill(p_RentalAmount DECIMAL(10,2), p_FineAmount DECIMAL(10,2)) 
RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
    RETURN p_RentalAmount + IFNULL(p_FineAmount, 0);
END //
DELIMITER ;

-- 4. STORED PROCEDURES
DELIMITER //
CREATE PROCEDURE ProcessVehicleReturn(
    IN p_RentalID INT, IN p_EndMileage INT, IN p_DamageCost DECIMAL(10,2)
)
BEGIN
    DECLARE v_ExpectedEnd DATE;
    DECLARE v_VehID INT;
    DECLARE v_Rate DECIMAL(10,2);
    DECLARE v_LateDays INT;
    DECLARE v_LateFine DECIMAL(10,2) DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid return or rental data.';
    END;

    START TRANSACTION;
    
    SELECT b.EndDate, b.VehicleID, c.DailyRate INTO v_ExpectedEnd, v_VehID, v_Rate
    FROM Rentals r JOIN Bookings b ON r.BookingID = b.BookingID JOIN Vehicles v ON b.VehicleID = v.VehicleID JOIN VehicleCategories c ON v.CategoryID = c.CategoryID
    WHERE r.RentalID = p_RentalID;
    
    IF v_VehID IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid rental.';
    END IF;

    SET v_LateDays = CalculateLateDays(v_ExpectedEnd, CURDATE());
    IF v_LateDays > 0 THEN
        SET v_LateFine = CalculateFine(v_LateDays, v_Rate);
        INSERT INTO Fines (RentalID, FineType, Amount, Description) VALUES (p_RentalID, 'Late Return', v_LateFine, 'Late days fee');
    END IF;

    IF p_DamageCost > 0 THEN
        INSERT INTO Fines (RentalID, FineType, Amount, Description) VALUES (p_RentalID, 'Damage', p_DamageCost, 'Vehicle Damage charges applied.');
    END IF;

    -- Update Rental (Trigger updates vehicle)
    UPDATE Rentals SET ActualEndDate = CURRENT_TIMESTAMP, EndMileage = p_EndMileage, RentalStatus = 'Completed' WHERE RentalID = p_RentalID;
    
    COMMIT;
END //

CREATE PROCEDURE ProcessPayment(IN p_PaymentID INT, IN p_Method VARCHAR(50), IN p_AmountPaid DECIMAL(10,2))
BEGIN
    DECLARE v_ExpectedAmount DECIMAL(10,2);
    DECLARE v_Count INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment failure.';
    END;

    START TRANSACTION;
    
    SELECT COUNT(*) INTO v_Count FROM Payments WHERE PaymentID = p_PaymentID AND PaymentStatus = 'Completed';
    IF v_Count > 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate payment.';
    END IF;
    
    SELECT Amount INTO v_ExpectedAmount FROM Payments WHERE PaymentID = p_PaymentID AND PaymentStatus = 'Pending';
    
    IF v_ExpectedAmount IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid payment ID.';
    END IF;
    
    IF p_AmountPaid < v_ExpectedAmount THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid payment amount.';
    END IF;

    UPDATE Payments SET PaymentStatus = 'Completed', PaymentMethod = p_Method, PaymentDate = CURRENT_TIMESTAMP WHERE PaymentID = p_PaymentID;
    COMMIT;
END //

CREATE PROCEDURE ProcessRefund(IN p_PaymentID INT)
BEGIN
    START TRANSACTION;
    UPDATE Payments SET PaymentStatus = 'Refunded' WHERE PaymentID = p_PaymentID;
    COMMIT;
END //
DELIMITER ;

-- 5. TRIGGERS
DELIMITER //
CREATE TRIGGER AfterPaymentUpdate_RentalStatus
AFTER UPDATE ON Payments
FOR EACH ROW
BEGIN
    -- Update payment status / log it
    IF OLD.PaymentStatus != 'Completed' AND NEW.PaymentStatus = 'Completed' THEN
        INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description)
        VALUES ('UPDATE', 'Payments', NEW.PaymentID, 'Payment processing successful.');
    END IF;
END //

CREATE TRIGGER AfterRentalReturn_UpdateVehicle
AFTER UPDATE ON Rentals
FOR EACH ROW
BEGIN
    -- Update rental status after payment/return -> change vehicle to Available
    IF OLD.RentalStatus != 'Completed' AND NEW.RentalStatus = 'Completed' THEN
        DECLARE v_VehID INT;
        SELECT VehicleID INTO v_VehID FROM Bookings WHERE BookingID = NEW.BookingID;
        UPDATE Vehicles SET Status = 'Available', CurrentMileage = NEW.EndMileage WHERE VehicleID = v_VehID;
    END IF;
END //
DELIMITER ;

-- 6. EVENTS
DELIMITER //
CREATE EVENT GenerateOverduePaymentRecords
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    -- Find unpaid/overdue payments and add a 5% penalty
    UPDATE Fines 
    SET Amount = Amount * 1.05 
    WHERE Status = 'Unpaid' 
    AND RentalID IN (SELECT RentalID FROM Rentals WHERE DATEDIFF(CURDATE(), ActualEndDate) > 30);
END //
DELIMITER ;
