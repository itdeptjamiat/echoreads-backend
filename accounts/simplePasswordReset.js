const Account = require('../models/accountCreate');
const bcrypt = require('bcrypt');

/**
 * Simple password reset - just email and new password
 * No OTP, no tokens, just direct password change
 */
const simplePasswordReset = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Basic validation
        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email and new password are required'
            });
        }

        // Simple password validation (just length)
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Find user by email
        const user = await Account.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Success response
        return res.status(200).json({
            success: true,
            message: 'Password reset successfully! You can now login with your new password.',
            data: {
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.log('Simple password reset error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again'
        });
    }
};

module.exports = simplePasswordReset; 