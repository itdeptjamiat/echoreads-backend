const Account = require('../models/accountCreate');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP email
 */
async function sendOtpEmail(email, otp) {
  // Configure your transporter (use environment variables for real projects)
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
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔐 Reset Your Password - OTP Inside!',
    html: `
      <div style="max-width:420px;margin:30px auto;padding:32px 24px;background:linear-gradient(135deg,#f8fafc 60%,#e0e7ff 100%);border-radius:18px;box-shadow:0 4px 24px rgba(60,60,120,0.10);font-family:'Segoe UI',Arial,sans-serif;">
        <div style="text-align:center;">
          <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="Lock Icon" width="64" style="margin-bottom:16px;" />
          <h2 style="color:#3730a3;margin-bottom:8px;">Reset Your Password</h2>
          <p style="color:#475569;font-size:16px;margin-bottom:24px;">
            Use the OTP below to reset your password. <br>
            <span style="color:#6366f1;font-weight:500;">This code is valid for 10 minutes.</span>
          </p>
          <div style="display:inline-block;background:#6366f1;color:#fff;font-size:2.2rem;letter-spacing:0.3em;padding:16px 32px;border-radius:12px;font-weight:bold;box-shadow:0 2px 8px rgba(99,102,241,0.10);margin-bottom:20px;">
            ${otp}
          </div>
          <p style="color:#64748b;font-size:14px;margin-top:24px;">
            If you did not request a password reset, please ignore this email.<br>
            <span style="font-size:12px;color:#a1a1aa;">&copy; ${new Date().getFullYear()} YourAppName</span>
          </p>
        </div>
      </div>
    `,
    text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Controller to generate and send reset password OTP
 */
const resetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Valid email is required.' });
    }

    // Find user by email
    const user = await Account.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    // Generate OTP and expiry
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP and expiry to user (assuming fields exist in schema)
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'OTP sent to your email address.' });
  } catch (error) {
    console.error('Reset Password OTP Error:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

module.exports = resetPasswordOtp;
