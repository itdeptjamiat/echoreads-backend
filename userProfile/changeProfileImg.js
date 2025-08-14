const User = require('../models/accountCreate');

const changeProfileImg = async (req, res) => {
    try {
        const { uid, profileImageUrl } = req.body;

        // Validate required parameters
        if (!uid || typeof uid !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'User ID (uid) is required and must be a number'
            });
        }

        if (!profileImageUrl || typeof profileImageUrl !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Profile image URL is required and must be a string'
            });
        }

        // Find and update user profile image
        const updatedUser = await User.findOneAndUpdate(
            { uid: uid },
            { profilePic: profileImageUrl },
            { new: true, runValidators: true }
        ).select('-password -__v'); // Exclude sensitive fields

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile image updated successfully',
            data: updatedUser
        });

    } catch (error) {
        console.log('Error updating profile image:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating profile image'
        });
    }
}

module.exports = changeProfileImg;
