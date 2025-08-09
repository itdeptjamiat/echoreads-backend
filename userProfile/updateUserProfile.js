const Account = require('../models/accountCreate');

/**
 * Controller to update user profile by uid
 * PUT /api/v1/user/profile/:uid
 * Body: { name, email, username, profilePic }
 */
const updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, email, username, profilePic } = req.body;

    // Validation for uid
    if (!uid) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID (uid) is required in params.' 
      });
    }

    // Ensure uid is a number
    const numericUid = Number(uid);
    if (isNaN(numericUid)) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID (uid) must be a number.' 
      });
    }

    // Check if user exists
    const existingUser = await Account.findOne({ uid: numericUid });
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found.' 
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    
    // Validate and add name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Name must be a non-empty string.' 
        });
      }
      updateData.name = name.trim();
    }

    // Validate and add email if provided
    if (email !== undefined) {
      if (typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ 
          success: false,
          message: 'Email must be a valid email address.' 
        });
      }

      // Check if email is already taken by another user
      const emailExists = await Account.findOne({ 
        email: email.toLowerCase().trim(), 
        uid: { $ne: numericUid } 
      });
      
      if (emailExists) {
        return res.status(409).json({ 
          success: false,
          message: 'Email is already taken by another user.' 
        });
      }
      
      updateData.email = email.toLowerCase().trim();
    }

    // Validate and add username if provided
    if (username !== undefined) {
      if (typeof username !== 'string' || username.trim().length < 3) {
        return res.status(400).json({ 
          success: false,
          message: 'Username must be at least 3 characters long.' 
        });
      }

      // Check if username is already taken by another user
      const usernameExists = await Account.findOne({ 
        username: username.trim(), 
        uid: { $ne: numericUid } 
      });
      
      if (usernameExists) {
        return res.status(409).json({ 
          success: false,
          message: 'Username is already taken by another user.' 
        });
      }
      
      updateData.username = username.trim();
    }

    // Validate and add profilePic if provided
    if (profilePic !== undefined) {
      if (typeof profilePic !== 'string' || profilePic.trim().length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Profile picture URL must be a non-empty string.' 
        });
      }
      
      // Basic URL validation
      try {
        new URL(profilePic.trim());
        updateData.profilePic = profilePic.trim();
      } catch (error) {
        return res.status(400).json({ 
          success: false,
          message: 'Profile picture must be a valid URL.' 
        });
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No valid fields provided for update.' 
      });
    }

    // Update the user profile
    const updatedUser = await Account.findOneAndUpdate(
      { uid: numericUid },
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        select: '-password -jwtToken -resetPasswordOtp -resetPasswordOtpExpiry -resetPasswordOtpVerified'
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found or update failed.' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully.',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update User Profile Error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken.` 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: 'Server error, please try again later.' 
    });
  }
};

module.exports = updateUserProfile; 