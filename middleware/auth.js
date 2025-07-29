const jwt = require('jsonwebtoken');
const Account = require('../models/accountCreate');
require('dotenv').config();

const verifyAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Find user in DB
    const user = await Account.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // Attach user to request for further use
    req.user = user;
    next();
  } catch (error) {
    console.error('verifyAdmin Error:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};
module.exports = verifyAdmin;