USE VehicleRentalDB;

-- ==========================================
-- MEMBER 1: Customer & User Management
-- ==========================================

-- 1. INDEXES
CREATE INDEX idx_customer_phone ON Customers(Phone);
CREATE INDEX idx_customer_email ON Customers(Email);
CREATE INDEX idx_customer_nic ON Customers(NIC_Passport);

-- 2. VIEWS
CREATE OR REPLACE VIEW CustomerRentalHistoryView AS
SELECT 
    c.CustomerID, c.FirstName, c.LastName, v.Make, v.Model, b.StartDate, b.EndDate, r.RentalStatus
FROM Customers c
JOIN Bookings b ON c.CustomerID = b.CustomerID
JOIN Rentals r ON b.BookingID = r.BookingID
JOIN Vehicles v ON b.VehicleID = v.VehicleID;

CREATE OR REPLACE VIEW ActiveCustomerView AS
SELECT CustomerID, FirstName, LastName, Phone, Email, Status
FROM Customers
WHERE Status = 'Active';

CREATE OR REPLACE VIEW UserProfileView AS
SELECT 
    u.UserID, 
    u.Username, 
    r.RoleName, 
    COALESCE(CONCAT(c.FirstName, ' ', c.LastName), CONCAT(e.FirstName, ' ', e.LastName), 'Admin') AS FullName,
    COALESCE(c.Status, 'Active') AS AccountStatus,
    u.CreatedAt
FROM Users u
JOIN Roles r ON u.RoleID = r.RoleID
LEFT JOIN Customers c ON u.UserID = c.UserID
LEFT JOIN Employees e ON u.UserID = e.UserID;

-- 3. UDFs
DELIMITER //
CREATE FUNCTION CustomerAge(p_DOB DATE) 
RETURNS INT DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, p_DOB, CURDATE());
END //

CREATE FUNCTION CustomerRentalCount(p_CustomerID INT) 
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE v_Count INT;
    SELECT COUNT(*) INTO v_Count FROM Bookings WHERE CustomerID = p_CustomerID;
    RETURN v_Count;
END //

CREATE FUNCTION CheckUserRole(p_UserID INT) 
RETURNS VARCHAR(50) DETERMINISTIC
BEGIN
    DECLARE v_Role VARCHAR(50);
    SELECT r.RoleName INTO v_Role 
    FROM Users u JOIN Roles r ON u.RoleID = r.RoleID 
    WHERE u.UserID = p_UserID;
    RETURN IFNULL(v_Role, 'Guest');
END //

CREATE FUNCTION IsUserActive(p_UserID INT)
RETURNS BOOLEAN DETERMINISTIC
BEGIN
    DECLARE v_Status VARCHAR(20);
    SELECT Status INTO v_Status FROM Customers WHERE UserID = p_UserID;
    IF v_Status IS NULL OR v_Status = 'Active' THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END //
DELIMITER ;

-- 4. STORED PROCEDURES (with Transactions and Error Handling)
DELIMITER //
CREATE PROCEDURE AuthenticateUser(
    IN p_Username VARCHAR(50),
    IN p_Password VARCHAR(255)
)
BEGIN
    DECLARE v_UserID INT;
    DECLARE v_StoredHash VARCHAR(255);
    DECLARE v_RoleName VARCHAR(50);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Authentication system error.';
    END;

    START TRANSACTION;

    SELECT u.UserID, u.PasswordHash, r.RoleName 
    INTO v_UserID, v_StoredHash, v_RoleName
    FROM Users u
    JOIN Roles r ON u.RoleID = r.RoleID
    WHERE u.Username = p_Username;

    IF v_UserID IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid username or password.';
    END IF;

    -- Accepts demo/hash match or password123
    IF v_StoredHash != p_Password AND p_Password != 'password123' AND v_StoredHash != SHA2(p_Password, 256) THEN
        INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description)
        VALUES ('LOGIN_FAILED', 'Users', v_UserID, CONCAT('Failed login attempt for: ', p_Username));
        COMMIT;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid username or password.';
    END IF;

    IF NOT IsUserActive(v_UserID) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account is inactive or blacklisted.';
    END IF;

    INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description)
    VALUES ('LOGIN_SUCCESS', 'Users', v_UserID, CONCAT('User logged in: ', p_Username, ' (', v_RoleName, ')'));

    COMMIT;

    SELECT * FROM UserProfileView WHERE UserID = v_UserID;
END //

CREATE PROCEDURE RegisterCustomer(
    IN p_Username VARCHAR(50), IN p_PasswordHash VARCHAR(255), IN p_RoleID INT,
    IN p_FirstName VARCHAR(50), IN p_LastName VARCHAR(50), IN p_NIC VARCHAR(50),
    IN p_DOB DATE, IN p_Phone VARCHAR(15), IN p_Email VARCHAR(100), IN p_Address VARCHAR(255)
)
BEGIN
    DECLARE v_UserID INT;
    
    -- Error Handling
    DECLARE EXIT HANDLER FOR 1062 -- Duplicate Key
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate phone, email, username or NIC/passport.';
    END;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid customer data provided.';
    END;

    IF p_DOB > CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid customer data: Invalid Date of Birth.';
    END IF;

    START TRANSACTION;
    
    INSERT INTO Users (Username, PasswordHash, RoleID) VALUES (p_Username, p_PasswordHash, p_RoleID);
    SET v_UserID = LAST_INSERT_ID();
    
    INSERT INTO Customers (UserID, FirstName, LastName, NIC_Passport, DOB, Phone, Email, Address)
    VALUES (v_UserID, p_FirstName, p_LastName, p_NIC, p_DOB, p_Phone, p_Email, p_Address);
    
    COMMIT;
END //

CREATE PROCEDURE UpdateCustomer(
    IN p_CustomerID INT, IN p_Phone VARCHAR(15), IN p_Email VARCHAR(100), IN p_Address VARCHAR(255)
)
BEGIN
    DECLARE v_Exists INT;
    
    -- Error Handling
    DECLARE EXIT HANDLER FOR 1062
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate phone or email.';
    END;
    
    START TRANSACTION;
    
    SELECT COUNT(*) INTO v_Exists FROM Customers WHERE CustomerID = p_CustomerID;
    IF v_Exists = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid customer ID.';
    END IF;
    
    UPDATE Customers SET Phone = p_Phone, Email = p_Email, Address = p_Address WHERE CustomerID = p_CustomerID;
    COMMIT;
END //
DELIMITER ;

-- 5. TRIGGERS
DELIMITER //
CREATE TRIGGER AfterCustomerInsert
AFTER INSERT ON Customers
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description)
    VALUES ('INSERT', 'Customers', NEW.CustomerID, CONCAT('New Customer Registered: ', NEW.NIC_Passport));
END //

CREATE TRIGGER AfterCustomerUpdateStatus
AFTER UPDATE ON Customers
FOR EACH ROW
BEGIN
    IF OLD.Status != NEW.Status THEN
        INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description)
        VALUES ('UPDATE', 'Customers', NEW.CustomerID, CONCAT('Customer Status changed to: ', NEW.Status));
    END IF;
END //
DELIMITER ;

-- 6. EVENTS
SET GLOBAL event_scheduler = ON;

DELIMITER //
CREATE EVENT MaintainCustomerStatus
ON SCHEDULE EVERY 1 MONTH
DO
BEGIN
    -- Customer account/status maintenance based on unpaid fines
    UPDATE Customers c
    SET c.Status = 'Blacklisted'
    WHERE c.CustomerID IN (
        SELECT b.CustomerID 
        FROM Bookings b 
        JOIN Rentals r ON b.BookingID = r.BookingID 
        JOIN Fines f ON r.RentalID = f.RentalID 
        WHERE f.Status = 'Unpaid' 
        GROUP BY b.CustomerID 
        HAVING COUNT(*) >= 3
    );
END //
DELIMITER ;
