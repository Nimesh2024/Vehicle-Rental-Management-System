USE VehicleRentalDB;

-- ==========================================
-- MEMBER 3: Rental & Booking Management
-- ==========================================

-- 1. INDEXES
CREATE INDEX idx_rental_date ON Rentals(RentalDate);
CREATE INDEX idx_booking_customer ON Bookings(CustomerID);
CREATE INDEX idx_booking_vehicle ON Bookings(VehicleID);
CREATE INDEX idx_rental_status ON Rentals(RentalStatus);

-- 2. VIEWS
CREATE OR REPLACE VIEW ActiveRentalsView AS
SELECT r.RentalID, b.CustomerID, v.RegistrationNumber, r.ActualStartDate, r.RentalStatus
FROM Rentals r
JOIN Bookings b ON r.BookingID = b.BookingID
JOIN Vehicles v ON b.VehicleID = v.VehicleID
WHERE r.RentalStatus = 'Ongoing';

CREATE OR REPLACE VIEW CustomerBookingView AS
SELECT b.BookingID, c.FirstName, c.LastName, v.Make, v.Model, b.StartDate, b.EndDate, b.Status
FROM Bookings b
JOIN Customers c ON b.CustomerID = c.CustomerID
JOIN Vehicles v ON b.VehicleID = v.VehicleID;

-- 3. UDFs
DELIMITER //
CREATE FUNCTION CalculateRentalDays(p_StartDate DATE, p_EndDate DATE) 
RETURNS INT DETERMINISTIC
BEGIN
    RETURN GREATEST(DATEDIFF(p_EndDate, p_StartDate), 1);
END //

CREATE FUNCTION CalculateRentalCost(p_Days INT, p_DailyRate DECIMAL(10,2)) 
RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
    RETURN p_Days * p_DailyRate;
END //
DELIMITER ;

-- 4. STORED PROCEDURES
DROP PROCEDURE IF EXISTS ConfirmBooking;

DELIMITER //
CREATE PROCEDURE ConfirmBooking(
    IN p_CustomerID INT, 
    IN p_VehicleID INT, 
    IN p_StartDate DATE, 
    IN p_EndDate DATE,
    IN p_DepositAmount DECIMAL(10,2)
)
proc_body: BEGIN
    DECLARE v_VehicleStatus VARCHAR(50);
    DECLARE v_Conflict INT DEFAULT 0;
    DECLARE v_ActualDeposit DECIMAL(10,2);
    DECLARE v_CustomerStatus VARCHAR(50);
    
    -- Structured Exception Handler: Guarantees ROLLBACK if any runtime SQL error occurs
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    -- 1. Date Range Pre-Validation
    IF p_StartDate > p_EndDate OR p_StartDate < CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid rental dates: Start date cannot be in the past, and must be on or before end date.';
    END IF;

    SET v_ActualDeposit = IFNULL(p_DepositAmount, 25000.00);

    -- 2. Concurrency Safety: Set Isolation Level to REPEATABLE READ for strict snapshot consistency
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    START TRANSACTION;
    
    -- 3. Customer Eligibility Check
    SELECT Status INTO v_CustomerStatus 
    FROM Customers 
    WHERE CustomerID = p_CustomerID;
    
    IF v_CustomerStatus IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Customer record not found.';
    ELSEIF v_CustomerStatus != 'Active' THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Customer account is not active or has been restricted.';
    END IF;

    -- 4. PESSIMISTIC LOCK: Acquire Exclusive Row Lock (X-Lock) on the target Vehicle.
    -- Any concurrent transaction attempting to book or alter this vehicle will wait until this transaction completes.
    SELECT Status INTO v_VehicleStatus 
    FROM Vehicles 
    WHERE VehicleID = p_VehicleID 
    FOR UPDATE;
    
    IF v_VehicleStatus IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Vehicle record not found.';
    ELSEIF v_VehicleStatus != 'Available' THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Selected vehicle is currently unavailable (under repair or decommissioned).';
    END IF;

    -- 5. RACE-CONDITION PREVENTION: Lock all active/confirmed bookings on this vehicle with FOR UPDATE
    -- and check for temporal date overlap [p_StartDate, p_EndDate] with existing bookings [StartDate, EndDate]
    SELECT COUNT(*) INTO v_Conflict 
    FROM Bookings 
    WHERE VehicleID = p_VehicleID 
      AND Status IN ('Pending', 'Confirmed') 
      AND (p_StartDate <= EndDate AND p_EndDate >= StartDate)
    FOR UPDATE;
    
    IF v_Conflict > 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Conflict detected: This vehicle is already reserved for overlapping dates by another customer.';
    END IF;

    -- 6. Insert Confirmed Booking Record atomically
    INSERT INTO Bookings (
        CustomerID, 
        VehicleID, 
        StartDate, 
        EndDate, 
        Status, 
        DepositAmount, 
        DepositStatus, 
        DepositPaymentMethod
    ) VALUES (
        p_CustomerID, 
        p_VehicleID, 
        p_StartDate, 
        p_EndDate, 
        'Confirmed', 
        v_ActualDeposit, 
        'Paid', 
        'Credit Card'
    );
    
    -- 7. Log to Security Audit Trail
    INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description)
    VALUES (
        'INSERT', 
        'Bookings', 
        LAST_INSERT_ID(), 
        CONCAT('Pessimistic-Lock Verified Booking Created: Vehicle #', p_VehicleID, ' for Customer #', p_CustomerID, ' (', p_StartDate, ' to ', p_EndDate, ')')
    );
    
    COMMIT;
END //

CREATE PROCEDURE CreateRental(
    IN p_BookingID INT, IN p_StartMileage INT
)
BEGIN
    DECLARE v_VehicleID INT;
    DECLARE v_Amount DECIMAL(10,2);
    DECLARE v_Days INT;
    DECLARE v_Rate DECIMAL(10,2);
    DECLARE v_RentalID INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error creating rental.';
    END;

    START TRANSACTION;
    
    SELECT b.VehicleID, CalculateRentalDays(b.StartDate, b.EndDate), c.DailyRate
    INTO v_VehicleID, v_Days, v_Rate
    FROM Bookings b JOIN Vehicles v ON b.VehicleID = v.VehicleID JOIN VehicleCategories c ON v.CategoryID = c.CategoryID
    WHERE b.BookingID = p_BookingID AND b.Status = 'Confirmed';
    
    IF v_VehicleID IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid booking.';
    END IF;

    -- Create Rental
    INSERT INTO Rentals (BookingID, RentalDate, StartMileage, RentalStatus)
    VALUES (p_BookingID, CURDATE(), p_StartMileage, 'Ongoing');
    
    SET v_RentalID = LAST_INSERT_ID();
    SET v_Amount = CalculateRentalCost(v_Days, v_Rate);
    
    -- Allocate Payment Record
    INSERT INTO Payments (RentalID, Amount, PaymentStatus) VALUES (v_RentalID, v_Amount, 'Pending');
    
    -- Update Booking
    UPDATE Bookings SET Status = 'Completed' WHERE BookingID = p_BookingID;
    
    COMMIT;
END //

CREATE PROCEDURE CancelRental(IN p_RentalID INT)
BEGIN
    START TRANSACTION;
    UPDATE Rentals SET RentalStatus = 'Cancelled' WHERE RentalID = p_RentalID;
    COMMIT;
END //
DELIMITER ;

-- 5. TRIGGERS
DELIMITER //
CREATE TRIGGER AfterRentalInsert_VehicleStatus
AFTER INSERT ON Rentals
FOR EACH ROW
BEGIN
    -- Automatically change vehicle status when rented
    DECLARE v_VehID INT;
    SELECT VehicleID INTO v_VehID FROM Bookings WHERE BookingID = NEW.BookingID;
    UPDATE Vehicles SET Status = 'Rented' WHERE VehicleID = v_VehID;
END //

CREATE TRIGGER AfterRentalUpdate_Status
AFTER UPDATE ON Rentals
FOR EACH ROW
BEGIN
    IF OLD.RentalStatus != NEW.RentalStatus THEN
        INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description)
        VALUES ('UPDATE', 'Rentals', NEW.RentalID, CONCAT('Rental Status Changed to: ', NEW.RentalStatus));
    END IF;
END //
DELIMITER ;

-- 6. EVENTS
DELIMITER //
CREATE EVENT DetectOverdueRentalsEvent
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    -- Automatically update overdue rental status
    UPDATE Rentals r
    JOIN Bookings b ON r.BookingID = b.BookingID
    SET r.RentalStatus = 'Overdue'
    WHERE r.RentalStatus = 'Ongoing' AND b.EndDate < CURDATE();
END //
DELIMITER ;
