const Account = require('../models/accountCreate');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * Generate a secure 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a secure reset token
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send OTP via email
 */
async function sendOtpEmail(email, otp, username) {
  try {
    // Configure email transporter
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
      subject: '🔐 Reset Your EchoReads Password - OTP Inside!',
      html: `
        <div style="max-width:500px;margin:30px auto;padding:32px 24px;background:linear-gradient(135deg,#f8fafc 60%,#e0e7ff 100%);border-radius:18px;box-shadow:0 4px 24px rgba(60,60,120,0.10);font-family:'Segoe UI',Arial,sans-serif;">
          <div style="text-align:center;">
            <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="Lock Icon" width="64" style="margin-bottom:16px;" />
            <h2 style="color:#3730a3;margin-bottom:8px;">Reset Your Password</h2>
            <p style="color:#475569;font-size:16px;margin-bottom:8px;">
              Hello <strong>${username}</strong>,<br>
              We received a request to reset your password.
            </p>
            <p style="color:#475569;font-size:16px;margin-bottom:24px;">
              Use the OTP below to reset your password. <br>
              <span style="color:#6366f1;font-weight:500;">This code is valid for 10 minutes.</span>
            </p>
            <div style="display:inline-block;background:#6366f1;color:#fff;font-size:2.2rem;letter-spacing:0.3em;padding:16px 32px;border-radius:12px;font-weight:bold;box-shadow:0 2px 8px rgba(99,102,241,0.10);margin-bottom:20px;">
              ${otp}
            </div>
            <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px;margin:16px 0;">
              <p style="color:#92400e;font-size:14px;margin:0;">
                <strong>Security Tip:</strong> Never share this OTP with anyone. EchoReads will never ask for your OTP.
              </p>
            </div>
            <p style="color:#64748b;font-size:14px;margin-top:24px;">
              If you did not request a password reset, please ignore this email.<br>
              <span style="font-size:12px;color:#a1a1aa;">&copy; ${new Date().getFullYear()} EchoReads. All rights reserved.</span>
            </p>
          </div>
        </div>
      `,
      text: `Hello ${username},\n\nYour OTP for password reset is: ${otp}\n\nThis code is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nEchoReads Team`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

/**
 * Request password reset with OTP
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
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
        message: 'User not found with the provided email.'
      });
    }

    // Check if user has recently requested a reset (rate limiting)
    const lastResetTime = user.resetPasswordOtpExpiry;
    const timeSinceLastReset = lastResetTime ? Date.now() - lastResetTime : 0;
    
    if (timeSinceLastReset < 2 * 60 * 1000) { // 2 minutes cooldown
      const remainingTime = Math.ceil((2 * 60 * 1000 - timeSinceLastReset) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingTime} seconds before requesting another OTP.`
      });
    }

    // Generate OTP and reset token
    const otp = generateOTP();
    const resetToken = generateResetToken();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP and reset token to user
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = otpExpiry;
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    const otpSent = await sendOtpEmail(user.email, otp, user.username);

    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully.',
      data: {
        email: user.email,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('Request Password Reset Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later.'
    });
  }
};

module.exports = requestPasswordReset;