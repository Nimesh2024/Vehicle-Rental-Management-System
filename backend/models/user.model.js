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
                COALESCE(c.Phone, b.ContactNumber, '-') AS Phone,
                COALESCE(c.Email, '-') AS Email,
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
     * Creates a new user (Manager, Staff, or Customer) with transaction and audit log
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

            // Role 2 (Branch Manager) or Role 3 (Rental Staff) -> Employees table
            if (parsedRoleId === 2 || parsedRoleId === 3) {
                const effectiveBranch = branchId || 1;
                const hireDate = new Date().toISOString().split('T')[0];
                await connection.execute(
                    'INSERT INTO Employees (UserID, BranchID, FirstName, LastName, HireDate) VALUES (?, ?, ?, ?, ?)',
                    [newUserId, effectiveBranch, firstName, lastName, hireDate]
                );

                await connection.execute(
                    'INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description) VALUES (?, ?, ?, ?)',
                    ['INSERT', 'Employees', newUserId, `Admin created ${parsedRoleId === 2 ? 'Branch Manager' : 'Rental Staff'} user: ${username}`]
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
                    ['INSERT', 'Customers', newUserId, `Admin created customer account: ${username}`]
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
     * Updates user profile (Name, Branch, Contact, Status).
     * IMPORTANT: Username and Password CANNOT be edited.
     */
    async updateUserProfile(userId, { firstName, lastName, branchId, phone, email, address, status }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [users] = await connection.execute('SELECT RoleID, Username FROM Users WHERE UserID = ?', [userId]);
            if (users.length === 0) {
                throw new Error('User record not found');
            }
            const roleId = users[0].RoleID;
            const username = users[0].Username;

            if (roleId === 2 || roleId === 3) {
                // Update Employee details
                await connection.execute(
                    `UPDATE Employees SET 
                        FirstName = COALESCE(?, FirstName),
                        LastName = COALESCE(?, LastName),
                        BranchID = COALESCE(?, BranchID)
                     WHERE UserID = ?`,
                    [firstName || null, lastName || null, branchId || null, userId]
                );
            } else if (roleId === 4) {
                // Update Customer details (cannot touch username/password)
                await connection.execute(
                    `UPDATE Customers SET 
                        FirstName = COALESCE(?, FirstName),
                        LastName = COALESCE(?, LastName),
                        Phone = COALESCE(?, Phone),
                        Email = COALESCE(?, Email),
                        Address = COALESCE(?, Address),
                        Status = COALESCE(?, Status)
                     WHERE UserID = ?`,
                    [firstName || null, lastName || null, phone || null, email || null, address || null, status || null, userId]
                );
            }

            await connection.execute(
                'INSERT INTO AuditLogs (ActionType, TableName, RecordID, Description) VALUES (?, ?, ?, ?)',
                ['UPDATE', 'Users', userId, `Admin updated profile for user: ${username} (Username/Password immutable)`]
            );

            await connection.commit();
            return { success: true };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
};

export default UserModel;
