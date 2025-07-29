const Account = require('../models/accountCreate');
const bcrypt = require('bcrypt');

/**
 * Controller to verify OTP and change password
 * Expects: { email, otp, newPassword }
 */
const newPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    // Find user by email
    const user = await Account.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    // Check if OTP matches and is not expired
    if (
      !user.resetPasswordOtp ||
      !user.resetPasswordOtpExpiry ||
      user.resetPasswordOtp !== otp ||
      Date.now() > user.resetPasswordOtpExpiry
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP fields
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('New Password Error:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

module.exports = newPassword;
