const Account = require('../models/accountCreate');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

/**
 * Generate a simple 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via email
 */
async function sendOtpEmail(email, otp, username) {
    try {
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
            subject: '🔐 Password Reset OTP - EchoReads',
            html: `
                <div style="max-width:500px;margin:30px auto;padding:32px 24px;background:linear-gradient(135deg,#f8fafc 60%,#e0e7ff 100%);border-radius:18px;box-shadow:0 4px 24px rgba(60,60,120,0.10);font-family:'Segoe UI',Arial,sans-serif;">
                    <div style="text-align:center;">
                        <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="Lock Icon" width="64" style="margin-bottom:16px;" />
                        <h2 style="color:#3730a3;margin-bottom:8px;">Password Reset OTP</h2>
                        <p style="color:#475569;font-size:16px;margin-bottom:8px;">
                            Hello <strong>${username}</strong>,<br>
                            Use this OTP to reset your password:
                        </p>
                        <div style="display:inline-block;background:#6366f1;color:#fff;font-size:2.2rem;letter-spacing:0.3em;padding:16px 32px;border-radius:12px;font-weight:bold;box-shadow:0 2px 8px rgba(99,102,241,0.10);margin-bottom:20px;">
                            ${otp}
                        </div>
                        <p style="color:#64748b;font-size:14px;">
                            This OTP is valid for 10 minutes.<br>
                            If you didn't request this, please ignore this email.
                        </p>
                    </div>
                </div>
            `,
            text: `Hello ${username},\n\nYour password reset OTP is: ${otp}\n\nThis code is valid for 10 minutes.\n\nBest regards,\nEchoReads Team`,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
}

/**
 * Step 1: Request OTP for password reset
 */
const requestPasswordResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
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

        // Generate OTP and set expiry
        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Save OTP to user
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpiry = otpExpiry;
        await user.save();

        // Send OTP via email
        const otpSent = await sendOtpEmail(user.email, otp, user.username);

        if (!otpSent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again'
            });
        }

        // Success response
        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email',
            data: {
                email: user.email,
                expiresIn: '10 minutes'
            }
        });

    } catch (error) {
        console.log('Request OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again'
        });
    }
};

/**
 * Step 2: Reset password with OTP verification
 */
const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate input
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        // Simple password validation
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

        // Check if OTP exists and is not expired
        if (!user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
            return res.status(400).json({
                success: false,
                message: 'No OTP request found. Please request a new OTP'
            });
        }

        // Check if OTP is expired
        if (Date.now() > user.resetPasswordOtpExpiry) {
            // Clear expired OTP
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpiry = undefined;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP'
            });
        }

        // Verify OTP
        if (user.resetPasswordOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please check and try again'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP fields
        user.password = hashedPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpiry = undefined;
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
        console.log('Reset password with OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again'
        });
    }
};

module.exports = {
    requestPasswordResetOtp,
    resetPasswordWithOtp
};