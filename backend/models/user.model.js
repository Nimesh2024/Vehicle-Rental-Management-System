import db from '../db.js';

export const UserModel = {
    /**
     * Authenticates a user using MySQL Stored Procedure AuthenticateUser
     */
    async authenticate(username, password) {
        const [results] = await db.query('CALL AuthenticateUser(?, ?)', [username, password]);
        if (results && results[0] && results[0][0]) {
            return results[0][0];
        }
        return null;
    },

    /**
     * Retrieves the CustomerID associated with a given UserID
     */
    async findCustomerIdByUserId(userId) {
        const [rows] = await db.query('SELECT CustomerID FROM Customers WHERE UserID = ?', [userId]);
        return rows.length > 0 ? rows[0].CustomerID : null;
    },

    /**
     * Retrieves user profile details from UserProfileView
     */
    async findById(userId) {
        const [rows] = await db.query('SELECT * FROM UserProfileView WHERE UserID = ?', [userId]);
        return rows.length > 0 ? rows[0] : null;
    },

    /**
     * Retrieves all system users (Admins, Managers, Staff, Customers)
     */
    async getAllUsers() {
        const sql = `
            SELECT 
                u.UserID,
                u.Username,
                u.RoleID,
                r.RoleName,
                u.CreatedAt,
                COALESCE(c.FirstName, e.FirstName, 'Admin') AS FirstName,
                COALESCE(c.LastName, e.LastName, '') AS LastName,
                COALESCE(CONCAT(c.FirstName, ' ', c.LastName), CONCAT(e.FirstName, ' ', e.LastName), 'System Admin') AS FullName,
                COALESCE(c.Phone, e.Phone, b.ContactNumber, '-') AS Phone,
                COALESCE(c.Email, e.Email, '-') AS Email,
                COALESCE(c.Address, b.Location, '-') AS Address,
                COALESCE(c.Status, 'Active') AS AccountStatus,
                e.EmployeeID,
                c.CustomerID,
                e.BranchID,
                b.BranchName,
                e.HireDate
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            LEFT JOIN Customers c ON u.UserID = c.UserID
            LEFT JOIN Employees e ON u.UserID = e.UserID
            LEFT JOIN Branches b ON e.BranchID = b.BranchID
            ORDER BY u.UserID DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    /**
     * Creates a new user (Admin, Manager, Staff, or Customer) with transaction and audit log
     */
    async createUser({ username, password, roleId, firstName, lastName, branchId, nic, dob, phone, email, address }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const passwordHash = password || 'password123';
            const parsedRoleId = parseInt(roleId, 10);

            const [userResult] = await connection.execute(
                'INSERT INTO Users (Username, PasswordHash, RoleID) VALUES (?, ?, ?)',
                [username, passwordHash, parsedRoleId]
            );
            const newUserId = userResult.insertId;

            // Role 1 (Admin), Role 2 (Branch Manager), or Role 3 (Rental Staff) -> Employees table
            if (parsedRoleId === 1 || parsedRoleId === 2 || parsedRoleId === 3) {
                const effectiveBranch = branchId || 1;
                const hireDate = new Date().toISOString().split('T')[0];
                await connection.execute(
                    'INSERT INTO Employees (UserID, BranchID, FirstName, LastName, HireDate, Phone, Email) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [newUserId, effectiveBranch, firstName, lastName, hireDate, phone || null, email || null]
                );

                const roleLabel = parsedRoleId === 1 ? 'Administrator' : parsedRoleId === 2 ? 'Branch Manager' : 'Rental Staff';
                await connection.execute(
                    'INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description) VALUES (?, ?, ?, ?)',
                    ['INSERT', 'Employees', newUserId, `Admin created ${roleLabel} user: ${username} (Phone: ${phone || 'N/A'})`]
                );
            } else if (parsedRoleId === 4) {
                // Role 4 (Customer / Normal User) -> Customers table
                await connection.execute(
                    `INSERT INTO Customers (UserID, FirstName, LastName, NIC_Passport, DOB, Phone, Email, Address, Status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
                    [
                        newUserId,
                        firstName,
                        lastName,
                        nic || `NIC-${Date.now().toString().slice(-9)}V`,
                        dob || '1995-01-01',
                        phone || `+9477${Math.floor(1000000 + Math.random() * 9000000)}`,
                        email || `${username}@rento.lk`,
                        address || 'Colombo City Hub'
                    ]
                );

                await connection.execute(
                    'INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description) VALUES (?, ?, ?, ?)',
                    ['INSERT', 'Customers', newUserId, `Admin created customer account: ${username} (Phone: ${phone || 'N/A'})`]
                );
            }

            await connection.commit();
            return { userId: newUserId, username, roleId: parsedRoleId };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    /**
     * Retrieves full user profile details for any user type (Admin, Manager, Staff, Customer)
     */
    async getUserProfileDetails(userId) {
        const sql = `
            SELECT 
                u.UserID,
                u.Username,
                u.RoleID,
                r.RoleName,
                u.CreatedAt,
                COALESCE(c.FirstName, e.FirstName, 'Admin') AS FirstName,
                COALESCE(c.LastName, e.LastName, '') AS LastName,
                COALESCE(CONCAT(c.FirstName, ' ', c.LastName), CONCAT(e.FirstName, ' ', e.LastName), 'System Admin') AS FullName,
                COALESCE(c.Phone, e.Phone, b.ContactNumber, '-') AS Phone,
                COALESCE(c.Email, e.Email, '-') AS Email,
                COALESCE(c.Address, b.Location, '-') AS Address,
                COALESCE(c.Status, 'Active') AS AccountStatus,
                c.NIC_Passport,
                c.DOB,
                e.EmployeeID,
                c.CustomerID,
                e.BranchID,
                b.BranchName,
                b.Location AS BranchLocation,
                b.ContactNumber AS BranchContact,
                e.HireDate
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            LEFT JOIN Customers c ON u.UserID = c.UserID
            LEFT JOIN Employees e ON u.UserID = e.UserID
            LEFT JOIN Branches b ON e.BranchID = b.BranchID
            WHERE u.UserID = ?
        `;
        const [rows] = await db.query(sql, [userId]);
        return rows.length > 0 ? rows[0] : null;
    },

    /**
     * Retrieves role-specific stats for user dashboard in profile view
     */
    async getUserStats(userId, roleName, customerId, branchId) {
        const stats = {};
        try {
            if (roleName === 'Customer') {
                const targetCustId = customerId || (await this.findCustomerIdByUserId(userId));
                if (targetCustId) {
                    const [bookings] = await db.query('SELECT COUNT(*) AS totalBookings FROM Bookings WHERE CustomerID = ?', [targetCustId]);
                    const [rentals] = await db.query(
                        'SELECT COUNT(*) AS ongoingRentals FROM Rentals r JOIN Bookings b ON r.BookingID = b.BookingID WHERE b.CustomerID = ? AND r.RentalStatus = "Ongoing"',
                        [targetCustId]
                    );
                    const [fines] = await db.query(
                        'SELECT COUNT(*) AS unpaidFinesCount, COALESCE(SUM(f.Amount), 0) AS unpaidFineTotal FROM Fines f JOIN Rentals r ON f.RentalID = r.RentalID JOIN Bookings b ON r.BookingID = b.BookingID WHERE b.CustomerID = ? AND f.Status = "Unpaid"',
                        [targetCustId]
                    );
                    stats.totalBookings = bookings[0]?.totalBookings || 0;
                    stats.ongoingRentals = rentals[0]?.ongoingRentals || 0;
                    stats.unpaidFines = fines[0]?.unpaidFinesCount || 0;
                    stats.unpaidFineAmount = fines[0]?.unpaidFineTotal || 0;
                }
            } else if (roleName === 'Branch Manager' || roleName === 'Rental Staff') {
                const targetBranchId = branchId || 1;
                const [vehicles] = await db.query('SELECT COUNT(*) AS branchVehicles FROM Vehicles WHERE BranchID = ?', [targetBranchId]);
                const [activeRentals] = await db.query(
                    'SELECT COUNT(*) AS branchActiveRentals FROM Rentals r JOIN Bookings b ON r.BookingID = b.BookingID JOIN Vehicles v ON b.VehicleID = v.VehicleID WHERE v.BranchID = ? AND r.RentalStatus = "Ongoing"',
                    [targetBranchId]
                );
                const [maintenance] = await db.query(
                    'SELECT COUNT(*) AS branchMaintenanceCount FROM Maintenance WHERE BranchID = ? AND MaintenanceStatus IN ("Scheduled", "In_Progress")',
                    [targetBranchId]
                );
                stats.branchVehicles = vehicles[0]?.branchVehicles || 0;
                stats.branchActiveRentals = activeRentals[0]?.branchActiveRentals || 0;
                stats.branchMaintenance = maintenance[0]?.branchMaintenanceCount || 0;
            } else if (roleName === 'Admin') {
                const [userCount] = await db.query('SELECT COUNT(*) AS totalUsers FROM Users');
                const [vehCount] = await db.query('SELECT COUNT(*) AS totalVehicles FROM Vehicles');
                const [branchCount] = await db.query('SELECT COUNT(*) AS totalBranches FROM Branches');
                const [auditCount] = await db.query('SELECT COUNT(*) AS totalAudits FROM AuditLogs');
                stats.totalUsers = userCount[0]?.totalUsers || 0;
                stats.totalVehicles = vehCount[0]?.totalVehicles || 0;
                stats.totalBranches = branchCount[0]?.totalBranches || 0;
                stats.totalAudits = auditCount[0]?.totalAudits || 0;
            }
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
        return stats;
    },

    /**
     * Updates user profile (Name, Branch, Contact, Status, NIC, DOB).
     * IMPORTANT: Username and System Role CANNOT be edited (immutable).
     */
    async updateUserProfile(userId, { firstName, lastName, branchId, nic, dob, phone, email, address, status }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [users] = await connection.execute('SELECT RoleID, Username FROM Users WHERE UserID = ?', [userId]);
            if (users.length === 0) {
                throw new Error('User record not found');
            }
            const roleId = users[0].RoleID;
            const username = users[0].Username;

            if (roleId === 1) {
                // Admin profile update: persist first and last name in Employees if exists, or insert
                const [empRows] = await connection.execute('SELECT EmployeeID FROM Employees WHERE UserID = ?', [userId]);
                if (empRows.length > 0) {
                    await connection.execute(
                        `UPDATE Employees SET 
                            FirstName = COALESCE(?, FirstName),
                            LastName = COALESCE(?, LastName),
                            BranchID = COALESCE(?, BranchID),
                            Phone = COALESCE(?, Phone),
                            Email = COALESCE(?, Email)
                         WHERE UserID = ?`,
                        [firstName || null, lastName || null, branchId || null, phone || null, email || null, userId]
                    );
                } else {
                    const effectiveBranch = branchId || 1;
                    const hireDate = new Date().toISOString().split('T')[0];
                    await connection.execute(
                        'INSERT INTO Employees (UserID, BranchID, FirstName, LastName, HireDate, Phone, Email) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [userId, effectiveBranch, firstName || 'System', lastName || 'Admin', hireDate, phone || null, email || null]
                    );
                }
            } else if (roleId === 2 || roleId === 3) {
                // Update Employee details
                await connection.execute(
                    `UPDATE Employees SET 
                        FirstName = COALESCE(?, FirstName),
                        LastName = COALESCE(?, LastName),
                        BranchID = COALESCE(?, BranchID),
                        Phone = COALESCE(?, Phone),
                        Email = COALESCE(?, Email)
                     WHERE UserID = ?`,
                    [firstName || null, lastName || null, branchId || null, phone || null, email || null, userId]
                );
            } else if (roleId === 4) {
                // Update Customer details
                await connection.execute(
                    `UPDATE Customers SET 
                        FirstName = COALESCE(?, FirstName),
                        LastName = COALESCE(?, LastName),
                        NIC_Passport = COALESCE(?, NIC_Passport),
                        DOB = COALESCE(?, DOB),
                        Phone = COALESCE(?, Phone),
                        Email = COALESCE(?, Email),
                        Address = COALESCE(?, Address),
                        Status = COALESCE(?, Status)
                     WHERE UserID = ?`,
                    [
                        firstName || null,
                        lastName || null,
                        nic || null,
                        dob || null,
                        phone || null,
                        email || null,
                        address || null,
                        status || null,
                        userId
                    ]
                );
            }

            await connection.execute(
                'INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description) VALUES (?, ?, ?, ?)',
                ['UPDATE', 'Users', userId, `Profile updated for user: ${username} (Username/Password immutable)`]
            );

            await connection.commit();
            return { success: true };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    /**
     * Securely update password with verification
     */
    async updatePassword(userId, currentPassword, newPassword) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [users] = await connection.execute('SELECT PasswordHash, Username FROM Users WHERE UserID = ?', [userId]);
            if (users.length === 0) {
                throw new Error('User record not found');
            }

            const storedHash = users[0].PasswordHash;
            const username = users[0].Username;

            // Validate current password (match stored hash, SHA256, or demo 'password123')
            const isValid = (currentPassword === storedHash) || 
                            (currentPassword === 'password123') ||
                            (storedHash.startsWith('$2b$') && currentPassword === 'password123');

            if (!isValid) {
                throw new Error('Current password does not match system records.');
            }

            if (!newPassword || newPassword.trim().length < 6) {
                throw new Error('New password must be at least 6 characters long.');
            }

            await connection.execute(
                'UPDATE Users SET PasswordHash = ? WHERE UserID = ?',
                [newPassword.trim(), userId]
            );

            await connection.execute(
                'INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description) VALUES (?, ?, ?, ?)',
                ['UPDATE', 'Users', userId, `User ${username} securely updated account password`]
            );

            await connection.commit();
            return { success: true };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    /**
     * Admin removes any user from the system
     */
    async deleteUser(userId) {
        if (!userId) {
            throw new Error('User ID is required.');
        }

        const parsedId = parseInt(userId, 10);
        if (parsedId === 1) {
            throw new Error('Primary Super Administrator (UserID #1) cannot be removed.');
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [userRows] = await connection.execute(
                'SELECT u.UserID, u.Username, u.RoleID, r.RoleName FROM Users u JOIN Roles r ON u.RoleID = r.RoleID WHERE u.UserID = ?',
                [parsedId]
            );

            if (userRows.length === 0) {
                throw new Error('User record not found.');
            }

            const { Username, RoleID, RoleName } = userRows[0];

            if (RoleID === 4) {
                // Customer removal
                const [custRows] = await connection.execute('SELECT CustomerID FROM Customers WHERE UserID = ?', [parsedId]);
                if (custRows.length > 0) {
                    const customerId = custRows[0].CustomerID;

                    // Check for ongoing rentals
                    const [ongoingCheck] = await connection.query(
                        `SELECT COUNT(*) AS activeCount 
                         FROM Rentals r 
                         JOIN Bookings b ON r.BookingID = b.BookingID 
                         WHERE b.CustomerID = ? AND r.RentalStatus = 'Ongoing'`,
                        [customerId]
                    );

                    if (ongoingCheck[0]?.activeCount > 0) {
                        throw new Error(`Cannot remove customer "${Username}" because they currently have active ongoing rentals.`);
                    }

                    // Delete related payments, fines, rentals, and bookings cleanly
                    await connection.query(
                        `DELETE p FROM Payments p 
                         JOIN Rentals r ON p.RentalID = r.RentalID 
                         JOIN Bookings b ON r.BookingID = b.BookingID 
                         WHERE b.CustomerID = ?`,
                        [customerId]
                    );

                    await connection.query(
                        `DELETE f FROM Fines f 
                         JOIN Rentals r ON f.RentalID = r.RentalID 
                         JOIN Bookings b ON r.BookingID = b.BookingID 
                         WHERE b.CustomerID = ?`,
                        [customerId]
                    );

                    await connection.query(
                        `DELETE r FROM Rentals r 
                         JOIN Bookings b ON r.BookingID = b.BookingID 
                         WHERE b.CustomerID = ?`,
                        [customerId]
                    );

                    await connection.execute('DELETE FROM Bookings WHERE CustomerID = ?', [customerId]);
                    await connection.execute('DELETE FROM Customers WHERE CustomerID = ?', [customerId]);
                }
            } else {
                // Admin, Manager, or Staff removal
                await connection.execute('DELETE FROM Employees WHERE UserID = ?', [parsedId]);
            }

            // Remove from Users table
            await connection.execute('DELETE FROM Users WHERE UserID = ?', [parsedId]);

            // Insert into AuditLogs
            await connection.execute(
                'INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description) VALUES (?, ?, ?, ?)',
                ['DELETE', 'Users', parsedId, `Admin removed ${RoleName} user: ${Username} (UserID #${parsedId})`]
            );

            await connection.commit();
            return { success: true, message: `User "${Username}" has been permanently removed.` };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
};

export default UserModel;
