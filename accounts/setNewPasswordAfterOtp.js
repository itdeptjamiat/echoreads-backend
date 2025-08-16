const Account = require('../models/accountCreate');
const bcrypt = require('bcrypt');

/**
 * Validate password strength
 */
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
}

/**
 * Send password change confirmation email
 */
async function sendPasswordChangeConfirmation(email, username) {
  try {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: 'smtp.stackmail.com',
      port: 465,
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER, // no-reply@echoreads.online
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"EchoReads" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Password Changed Successfully - EchoReads',
      html: `
        <div style="max-width:500px;margin:30px auto;padding:32px 24px;background:linear-gradient(135deg,#f0fdf4 60%,#dcfce7 100%);border-radius:18px;box-shadow:0 4px 24px rgba(60,60,120,0.10);font-family:'Segoe UI',Arial,sans-serif;">
          <div style="text-align:center;">
            <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Success Icon" width="64" style="margin-bottom:16px;" />
            <h2 style="color:#166534;margin-bottom:8px;">Password Changed Successfully</h2>
            <p style="color:#475569;font-size:16px;margin-bottom:8px;">
              Hello <strong>${username}</strong>,<br>
              Your password has been successfully changed.
            </p>
            <div style="background:#dcfce7;border:1px solid #16a34a;border-radius:8px;padding:12px;margin:16px 0;">
              <p style="color:#166534;font-size:14px;margin:0;">
                <strong>Security Notice:</strong> If you did not change your password, please contact support immediately.
              </p>
            </div>
            <p style="color:#64748b;font-size:14px;margin-top:24px;">
              You can now login to your EchoReads account with your new password.<br>
              <span style="font-size:12px;color:#a1a1aa;">&copy; ${new Date().getFullYear()} EchoReads. All rights reserved.</span>
            </p>
          </div>
        </div>
      `,
      text: `Hello ${username},\n\nYour password has been successfully changed.\n\nYou can now login to your EchoReads account with your new password.\n\nIf you did not change your password, please contact support immediately.\n\nBest regards,\nEchoReads Team`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Password change confirmation email error:', error);
    return false;
  }
}

/**
 * Set new password after OTP verification
 * This API allows users to set a new password immediately after OTP verification
 * without requiring a separate reset token
 */
const setNewPasswordAfterOtp = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, new password, and confirm password are required.'
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Validate password strength
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed.',
        errors: passwordErrors
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
      user.resetPasswordOtpVerified = false;
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

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear all reset fields
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    user.resetPasswordOtpVerified = false;
    await user.save();

    // Send confirmation email
    await sendPasswordChangeConfirmation(user.email, user.username);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. You can now login with your new password.',
      data: {
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Set New Password After OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later.'
    });
  }
};

module.exports = setNewPasswordAfterOtp; 