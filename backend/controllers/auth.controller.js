import UserModel from '../models/user.model.js';

export const AuthController = {
    /**
     * Authenticates credentials against AuthenticateUser Stored Procedure
     */
    async login(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        try {
            const user = await UserModel.authenticate(username, password);
            if (!user) {
                return res.status(401).json({ error: 'Authentication failed.' });
            }

            // If user is a customer, attach CustomerID
            if (user.RoleName === 'Customer') {
                const customerId = await UserModel.findCustomerIdByUserId(user.UserID);
                if (customerId) {
                    user.CustomerID = customerId;
                }
            }

            res.json({ success: true, user });
        } catch (err) {
            res.status(401).json({ error: err.sqlMessage || err.message });
        }
    },

    /**
     * Retrieves all system users (Admins, Managers, Staff, Customers)
     */
    async getAllUsers(req, res) {
        try {
            const users = await UserModel.getAllUsers();
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    /**
     * Admin creates a Manager (Role 2), Staff (Role 3), or Customer (Role 4)
     */
    async createUser(req, res) {
        const { username, password, roleId, firstName, lastName, branchId, nic, dob, phone, email, address } = req.body;
        
        if (!username || !password || !roleId || !firstName) {
            return res.status(400).json({ error: 'Username, password, role, and first name are required.' });
        }

        try {
            const result = await UserModel.createUser({
                username,
                password,
                roleId: parseInt(roleId, 10),
                firstName,
                lastName: lastName || '',
                branchId: branchId ? parseInt(branchId, 10) : 1,
                nic,
                dob,
                phone,
                email,
                address
            });
            res.status(201).json({ success: true, message: 'User created successfully', result });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Username, Phone, Email, or NIC is already in use.' });
            }
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    /**
     * Admin updates a user profile.
     * Username and password CANNOT be edited.
     */
    async updateUser(req, res) {
        const userId = parseInt(req.params.id, 10);
        const { firstName, lastName, branchId, phone, email, address, status } = req.body;

        try {
            await UserModel.updateUserProfile(userId, {
                firstName,
                lastName,
                branchId: branchId ? parseInt(branchId, 10) : null,
                phone,
                email,
                address,
                status
            });
            res.json({ success: true, message: 'User profile updated successfully (Username/Password immutable).' });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    }
};

export default AuthController;
