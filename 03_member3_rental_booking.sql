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
DELIMITER //
CREATE PROCEDURE ConfirmBooking(
    IN p_CustomerID INT, IN p_VehicleID INT, IN p_StartDate DATE, IN p_EndDate DATE
)
BEGIN
    DECLARE v_VehicleStatus VARCHAR(50);
    DECLARE v_Conflict INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid customer/vehicle or database error.';
    END;

    IF p_StartDate > p_EndDate OR p_StartDate < CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid rental dates.';
    END IF;

    START TRANSACTION;
    
    SELECT Status INTO v_VehicleStatus FROM Vehicles WHERE VehicleID = p_VehicleID;
    IF v_VehicleStatus != 'Available' THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Vehicle unavailable.';
    END IF;

    SELECT COUNT(*) INTO v_Conflict FROM Bookings 
    WHERE VehicleID = p_VehicleID AND Status IN ('Pending', 'Confirmed') 
    AND (p_StartDate <= EndDate AND p_EndDate >= StartDate);
    
    IF v_Conflict > 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate booking or dates overlap.';
    END IF;

    INSERT INTO Bookings (CustomerID, VehicleID, StartDate, EndDate, Status)
    VALUES (p_CustomerID, p_VehicleID, p_StartDate, p_EndDate, 'Confirmed');
    
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
