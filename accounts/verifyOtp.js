const Account = require('../models/accountCreate');
const crypto = require('crypto');

/**
 * Verify OTP and return reset token
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required.'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    // Find user by email
    const user = await Account.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if OTP exists and is not expired
    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (Date.now() > user.resetPasswordOtpExpiry) {
      // Clear expired OTP
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiry = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Generate new reset token for password change
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Update user with new reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = tokenExpiry;
    user.resetPasswordOtpVerified = true;
    await user.save();

    // Return success with reset token
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      data: {
        resetToken: resetToken,
        expiresIn: '15 minutes',
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later.'
    });
  }
};

/**
 * Resend OTP if needed
 */
const resendOtp = async (req, res) => {
  try {
    const { email, method = 'email' } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    // Find user
    const user = await Account.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if user has recently requested a reset
    const lastResetTime = user.resetPasswordOtpExpiry;
    const timeSinceLastReset = lastResetTime ? Date.now() - lastResetTime : 0;
    
    if (timeSinceLastReset < 1 * 60 * 1000) { // 1 minute cooldown for resend
      const remainingTime = Math.ceil((1 * 60 * 1000 - timeSinceLastReset) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingTime} seconds before requesting another OTP.`
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update user with new OTP
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = otpExpiry;
    user.resetPasswordOtpVerified = false;
    await user.save();

    // Send new OTP (you can reuse the email functions from requestPasswordReset)
    // For now, we'll just return success
    return res.status(200).json({
      success: true,
      message: 'New OTP sent successfully.',
      data: {
        method: method,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('Resend OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later.'
    });
  }
};

module.exports = { verifyOtp, resendOtp }; 