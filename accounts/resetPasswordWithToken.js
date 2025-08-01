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
 * Reset password using reset token
 */
const resetPasswordWithToken = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token, new password, and confirm password are required.'
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

    // Find user by reset token
    const user = await Account.findOne({
      resetPasswordToken: resetToken,
      resetPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Check if OTP was verified
    if (!user.resetPasswordOtpVerified) {
      return res.status(400).json({
        success: false,
        message: 'OTP verification required before password reset.'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset fields
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
      message: 'Password reset successfully. You can now login with your new password.',
      data: {
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later.'
    });
  }
};

/**
 * Send password change confirmation email
 */
async function sendPasswordChangeConfirmation(email, username) {
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
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
 * Check password reset token validity
 */
const checkResetToken = async (req, res) => {
  try {
    const { resetToken } = req.body;

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required.'
      });
    }

    // Find user by reset token
    const user = await Account.findOne({
      resetPasswordToken: resetToken,
      resetPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.'
      });
    }

    // Check if OTP was verified
    if (!user.resetPasswordOtpVerified) {
      return res.status(400).json({
        success: false,
        message: 'OTP verification required.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reset token is valid.',
      data: {
        email: user.email,
        username: user.username,
        expiresIn: Math.ceil((user.resetPasswordTokenExpiry - Date.now()) / 1000 / 60) + ' minutes'
      }
    });

  } catch (error) {
    console.error('Check Reset Token Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later.'
    });
  }
};

module.exports = { resetPasswordWithToken, checkResetToken }; 