const Account = require('../models/accountCreate');

const deleteUser = async (req, res) => {
    try {
        const { targetUid, adminUid } = req.body;

        if (!targetUid) {
            return res.status(400).json({ message: 'Target User ID (targetUid) is required' });
        }
        if (!adminUid) {
            return res.status(400).json({ message: 'Admin User ID (adminUid) is required' });
        }

        // Verify admin authorization
        const admin = await Account.findOne({ uid: adminUid });
        if (!admin) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        if (admin.userType !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete users' });
        }

        // Check if target user exists
        const targetUser = await Account.findOne({ uid: targetUid });

        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        // Prevent admin from deleting themselves
        if (targetUid === adminUid) {
            return res.status(400).json({ 
                message: 'Admin cannot delete their own account' 
            });
        }

        // Prevent deletion of other admin accounts (optional security measure)
        if (targetUser.userType === 'admin') {
            return res.status(400).json({ 
                message: 'Cannot delete another admin account' 
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
        await Account.deleteOne({ uid: targetUid });

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