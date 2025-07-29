const Account = require('../models/accountCreate');

/**
 * Controller to get user profile by uid (from params)
 * Returns user data excluding password and jwtToken
 * Note: uid is a number, not MongoDB _id
 */
const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ message: 'User ID (uid) is required in params.' });
    }

    // Ensure uid is a number
    const numericUid = Number(uid);
    if (isNaN(numericUid)) {
      return res.status(400).json({ message: 'User ID (uid) must be a number.' });
    }

    // Find user by uid (number), exclude password and jwtToken
    const user = await Account.findOne({ uid: numericUid }).select('-password -jwtToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

module.exports = getUserProfile;
