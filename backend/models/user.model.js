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
    }
};

export default UserModel;
