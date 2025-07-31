const Account = require('../models/accountCreate');

const checkExpiredPlans = async (req, res) => {
    try {
        const { adminUid } = req.body;

        if (!adminUid) {
            return res.status(400).json({ 
                success: false,
                message: 'Admin User ID (adminUid) is required' 
            });
        }

        // Verify admin authorization
        const admin = await Account.findOne({ uid: adminUid });
        if (!admin) {
            return res.status(404).json({ 
                success: false,
                message: 'Admin user not found' 
            });
        }

        if (admin.userType !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'You are not authorized to perform this operation' 
            });
        }

        const currentDate = new Date();

        // Find all users with expired plans
        const expiredUsers = await Account.find({
            plan: { $in: ['echopro', 'echoproplus'] },
            planExpiry: { $lt: currentDate }
        });

        // Update expired users to free plan
        const updatePromises = expiredUsers.map(async (user) => {
            const updatedUser = await Account.findOneAndUpdate(
                { uid: user.uid },
                { 
                    plan: 'free',
                    planExpiry: null,
                    planStart: null
                },
                { new: true }
            );
            return updatedUser;
        });

        const updatedUsers = await Promise.all(updatePromises);

        // Get statistics
        const totalExpired = expiredUsers.length;
        const echoproExpired = expiredUsers.filter(user => user.plan === 'echopro').length;
        const echoproplusExpired = expiredUsers.filter(user => user.plan === 'echoproplus').length;

        const result = {
            success: true,
            message: `Successfully updated ${totalExpired} expired subscriptions to free plan`,
            statistics: {
                totalExpired: totalExpired,
                echoproExpired: echoproExpired,
                echoproplusExpired: echoproplusExpired
            },
            updatedUsers: updatedUsers.map(user => ({
                uid: user.uid,
                username: user.username,
                email: user.email,
                previousPlan: user.plan,
                newPlan: 'free',
                planExpiry: user.planExpiry
            }))
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('Check Expired Plans Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = checkExpiredPlans; 