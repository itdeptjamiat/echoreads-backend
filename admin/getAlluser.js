const Account = require('../models/accountCreate');
const jwt = require('jsonwebtoken');
require('dotenv').config();


/**
 * Controller to get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await Account.find({}, '-password -jwtToken'); // Exclude sensitive fields
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Get All Users Error:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

// Export as an array for router usage: [middleware, controller]
module.exports =  getAllUsers;
