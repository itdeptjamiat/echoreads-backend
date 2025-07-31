const Account = require('../models/accountCreate');

const deleteUser = async (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({ message: 'User ID (uid) is required' });
        }

        // Check if target user exists
        const targetUser = await Account.findOne({ uid });

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deletion of admin accounts
        if (targetUser.userType === 'admin') {
            return res.status(400).json({ 
                message: 'Cannot delete admin accounts' 
            });
        }

        // Get user info before deletion for logging
        const userInfo = {
            uid: targetUser.uid,
            username: targetUser.username,
            email: targetUser.email,
            userType: targetUser.userType,
            plan: targetUser.plan
        };

        // Delete the user account
        await Account.deleteOne({ uid });

        return res.status(200).json({ 
            message: 'User deleted successfully',
            deletedUser: {
                uid: userInfo.uid,
                username: userInfo.username,
                email: userInfo.email
            }
        });
    } catch (error) {
        console.error('Delete User Error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = deleteUser;