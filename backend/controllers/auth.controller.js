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
    }
};

export default AuthController;
