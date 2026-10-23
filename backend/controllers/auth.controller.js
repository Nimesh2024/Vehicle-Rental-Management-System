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

            // Enrich user with complete profile data across joined tables
            const fullProfile = await UserModel.getUserProfileDetails(user.UserID);
            const enrichedUser = { ...user, ...(fullProfile || {}) };

            res.json({ success: true, user: enrichedUser });
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
        const { firstName, lastName, branchId, nic, dob, phone, email, address, status } = req.body;

        try {
            await UserModel.updateUserProfile(userId, {
                firstName,
                lastName,
                branchId: branchId ? parseInt(branchId, 10) : null,
                nic,
                dob,
                phone,
                email,
                address,
                status
            });
            const updatedProfile = await UserModel.getUserProfileDetails(userId);
            res.json({ 
                success: true, 
                message: 'User profile updated successfully (Username/Password immutable).',
                user: updatedProfile
            });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    /**
     * Get profile details & role statistics for currently logged-in user
     */
    async getProfile(req, res) {
        const userId = parseInt(req.params.id, 10);
        try {
            const profile = await UserModel.getUserProfileDetails(userId);
            if (!profile) {
                return res.status(404).json({ error: 'User profile record not found.' });
            }
            const stats = await UserModel.getUserStats(userId, profile.RoleName, profile.CustomerID, profile.BranchID);
            res.json({ success: true, profile, stats });
        } catch (err) {
            res.status(500).json({ error: err.sqlMessage || err.message });
        }
    },

    /**
     * Self-profile editor for all user types (Admin, Manager, Staff, Customer)
     */
    async updateProfile(req, res) {
        const userId = parseInt(req.params.id, 10);
        const { firstName, lastName, branchId, nic, dob, phone, email, address, status } = req.body;

        try {
            await UserModel.updateUserProfile(userId, {
                firstName,
                lastName,
                branchId: branchId ? parseInt(branchId, 10) : null,
                nic,
                dob,
                phone,
                email,
                address,
                status
            });

            const updatedProfile = await UserModel.getUserProfileDetails(userId);
            res.json({
                success: true,
                message: 'Your profile has been successfully updated.',
                user: updatedProfile
            });
        } catch (err) {
            res.status(400).json({ error: err.sqlMessage || err.message });
        }
    },

    /**
     * Change account password with verification of old credentials
     */
    async changePassword(req, res) {
        const userId = parseInt(req.params.id, 10);
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required.' });
        }

        try {
            await UserModel.updatePassword(userId, currentPassword, newPassword);
            res.json({ success: true, message: 'Password updated successfully.' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    /**
     * Admin removes any user from the system
     */
    async deleteUser(req, res) {
        const userId = parseInt(req.params.id, 10);
        try {
            const result = await UserModel.deleteUser(userId);
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
};

export default AuthController;
