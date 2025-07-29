const Account = require('../models/accountCreate');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Helper to check if a value is empty or undefined
 */
function isEmpty(val) {
  return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (isEmpty(email) || isEmpty(password)) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await Account.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      userType: user.userType,
      uid: user.uid
    };
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    // Store token in database
    user.jwtToken = token;
    await user.save();

    // Login successful
    return res.status(200).json({
      message: 'Login successful',
      user: {
        user: user,
        token: token
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

module.exports = login;
