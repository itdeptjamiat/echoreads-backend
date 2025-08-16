const Account = require('../models/accountCreate');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Helper to check if a value is empty or undefined
 */
function isEmpty(val) {
  return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
}

/**
 * Validate that required email environment variables are set
 * Throws an error if not set
 */
function validateEmailEnv() {
  if (isEmpty(process.env.EMAIL_USER) || isEmpty(process.env.EMAIL_PASS)) {
    throw new Error(
      'EMAIL_USER and EMAIL_PASS environment variables must be set for sending emails. ' +
      'Please check your .env file and restart the server.'
    );
  }
}

let transporter;
try {
  validateEmailEnv();
  transporter = nodemailer.createTransport({
    host: 'smtp.stackmail.com',
    port: 465,
    secure: true, // true for port 465
    auth: {
      user: process.env.EMAIL_USER, // no-reply@echoreads.online
      pass: process.env.EMAIL_PASS,
    },
  });
} catch (err) {
  // Log error and set transporter to null so we can handle it gracefully later
  console.error('Nodemailer Transporter Error:', err.message);
  transporter = null;
}

function getSignupSuccessEmailHtml({ name, username }) {
  return `
    <div style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 8px 32px rgba(40,60,120,0.18); overflow: hidden;">
        <div style="background: #2575fc; color: #fff; padding: 32px 0; text-align: center;">
          <img src="https://img.icons8.com/color/96/000000/checked-2--v2.png" alt="Success" style="width: 64px; margin-bottom: 12px;">
          <h1 style="margin: 0; font-size: 2.2rem; font-family: 'Segoe UI',sans-serif;">Welcome, ${name}!</h1>
        </div>
        <div style="padding: 32px 28px 24px 28px; text-align: center;">
          <h2 style="color: #2575fc; font-family: 'Segoe UI',sans-serif; margin-bottom: 12px;">Signup Successful 🎉</h2>
          <p style="font-size: 1.1rem; color: #444; margin-bottom: 24px;">
            Hi <b>${name}</b>,<br>
            Your account has been created successfully.<br>
            <span style="display:inline-block; margin-top:10px; color:#888;">Username: <b>${username}</b></span>
          </p>
          <a href="https://abubakkar.online" style="display:inline-block; background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(40,60,120,0.10); transition: background 0.2s;">
            Go to Login
          </a>
        </div>
        <div style="background: #f4f8fb; color: #888; font-size: 0.95rem; text-align: center; padding: 18px 0;">
          If you did not sign up, please ignore this email.<br>
          &copy; ${new Date().getFullYear()} YourAppName
        </div>
      </div>
    </div>
  `;
}

const signup = async (req, res) => {
  try {
    const { email, username, password, name } = req.body;

    // Basic validation
    if (isEmpty(email) || isEmpty(username) || isEmpty(password)) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await Account.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' }); // 409 Conflict
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique 6-digit UID
    const uid = Math.floor(100000 + Math.random() * 900000);

    // Create and save new user
    const newUser = new Account({
      email,
      username,
      password: hashedPassword,
      name,
      uid
    });

    await newUser.save();

    // Send signup success email if transporter is available
    if (transporter) {
      const mailOptions = {
        from: `"echoRides" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to echoRides! Signup Successful 🎉',
        html: getSignupSuccessEmailHtml({ name, username }),
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Signup Email Error:', err);
          // Don't fail signup if email fails, just log
        }
      });
    } else {
      console.warn('Signup Email not sent: Email transporter is not configured. Check EMAIL_USER and EMAIL_PASS in your .env file.');
    }

    return res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

module.exports = signup;
