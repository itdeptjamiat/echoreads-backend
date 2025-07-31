const Account = require('../models/accountCreate');
const { autoExpiryCheck, getExpiryStatistics } = require('./autoExpiryCheck');

const getExpiryManagement = async (req, res) => {
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
                message: 'You are not authorized to access expiry management' 
            });
        }

        // Get expiry statistics
        const expiryStats = await getExpiryStatistics();

        if (!expiryStats.success) {
            return res.status(500).json(expiryStats);
        }

        res.status(200).json({
            success: true,
            message: 'Expiry management data retrieved successfully',
            ...expiryStats
        });

    } catch (error) {
        console.error('Get Expiry Management Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

const triggerAutoExpiryCheck = async (req, res) => {
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
                message: 'You are not authorized to trigger auto expiry check' 
            });
        }

        // Trigger automatic expiry check
        const result = await autoExpiryCheck();

        res.status(200).json({
            success: true,
            message: 'Auto expiry check triggered successfully',
            result: result
        });

    } catch (error) {
        console.error('Trigger Auto Expiry Check Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

const getExpiringSoonUsers = async (req, res) => {
    try {
        const { adminUid, days = 30 } = req.body;

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
                message: 'You are not authorized to view expiring users' 
            });
        }

        const currentDate = new Date();
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + parseInt(days));

        // Find users expiring within specified days
        const expiringUsers = await Account.find({
            plan: { $in: ['echopro', 'echoproplus'] },
            planExpiry: { 
                $gte: currentDate,
                $lte: targetDate
            }
        }).select('uid username email plan planExpiry planStart');

        const expiringUsersWithDays = expiringUsers.map(user => ({
            uid: user.uid,
            username: user.username,
            email: user.email,
            plan: user.plan,
            planExpiry: user.planExpiry,
            planStart: user.planStart,
            daysUntilExpiry: Math.ceil((user.planExpiry - currentDate) / (1000 * 60 * 60 * 24))
        }));

        // Sort by days until expiry (ascending)
        expiringUsersWithDays.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

        res.status(200).json({
            success: true,
            message: `Found ${expiringUsersWithDays.length} users expiring within ${days} days`,
            daysThreshold: parseInt(days),
            expiringUsers: expiringUsersWithDays,
            statistics: {
                totalExpiring: expiringUsersWithDays.length,
                echoproExpiring: expiringUsersWithDays.filter(user => user.plan === 'echopro').length,
                echoproplusExpiring: expiringUsersWithDays.filter(user => user.plan === 'echoproplus').length,
                expiringToday: expiringUsersWithDays.filter(user => user.daysUntilExpiry === 0).length,
                expiringThisWeek: expiringUsersWithDays.filter(user => user.daysUntilExpiry <= 7).length
            }
        });

    } catch (error) {
        console.error('Get Expiring Soon Users Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = { 
    getExpiryManagement, 
    triggerAutoExpiryCheck, 
    getExpiringSoonUsers 
}; 