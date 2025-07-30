const Account = require('../models/accountCreate');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adminResetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await Account.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({ message: 'Password reset successfully.' });

    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'An error occurred while resetting the password.' });
    }
};


module.exports = adminResetPassword;