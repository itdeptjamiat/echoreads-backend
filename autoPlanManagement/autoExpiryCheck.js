const Account = require('../models/accountCreate');

const autoExpiryCheck = async () => {
    try {
        const currentDate = new Date();
        console.log(`[${new Date().toISOString()}] Starting automatic expiry check...`);

        // Find all users with expired plans
        const expiredUsers = await Account.find({
            plan: { $in: ['echopro', 'echoproplus'] },
            planExpiry: { $lt: currentDate }
        });

        if (expiredUsers.length === 0) {
            console.log(`[${new Date().toISOString()}] No expired subscriptions found.`);
            return {
                success: true,
                message: 'No expired subscriptions found',
                statistics: {
                    totalExpired: 0,
                    echoproExpired: 0,
                    echoproplusExpired: 0
                }
            };
        }

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
            
            console.log(`[${new Date().toISOString()}] Updated user ${user.username} (UID: ${user.uid}) from ${user.plan} to free plan`);
            return updatedUser;
        });

        const updatedUsers = await Promise.all(updatePromises);

        // Get statistics
        const totalExpired = expiredUsers.length;
        const echoproExpired = expiredUsers.filter(user => user.plan === 'echopro').length;
        const echoproplusExpired = expiredUsers.filter(user => user.plan === 'echoproplus').length;

        const result = {
            success: true,
            message: `Automatically updated ${totalExpired} expired subscriptions to free plan`,
            timestamp: new Date().toISOString(),
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
                newPlan: 'free'
            }))
        };

        console.log(`[${new Date().toISOString()}] Automatic expiry check completed. Updated ${totalExpired} users.`);
        return result;

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Auto Expiry Check Error:`, error.message);
        return {
            success: false,
            message: 'Error during automatic expiry check',
            error: error.message
        };
    }
};

// Function to get expiry statistics without updating
const getExpiryStatistics = async () => {
    try {
        const currentDate = new Date();

        // Get all paid users
        const paidUsers = await Account.find({
            plan: { $in: ['echopro', 'echoproplus'] }
        });

        // Categorize users
        const activeUsers = paidUsers.filter(user => {
            return user.planExpiry ? currentDate < user.planExpiry : true;
        });

        const expiredUsers = paidUsers.filter(user => {
            return user.planExpiry ? currentDate >= user.planExpiry : false;
        });

        const expiringSoon = paidUsers.filter(user => {
            if (!user.planExpiry) return false;
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            return user.planExpiry <= thirtyDaysFromNow && user.planExpiry > currentDate;
        });

        return {
            success: true,
            statistics: {
                totalPaidUsers: paidUsers.length,
                activeSubscriptions: activeUsers.length,
                expiredSubscriptions: expiredUsers.length,
                expiringSoon: expiringSoon.length,
                echoproUsers: paidUsers.filter(user => user.plan === 'echopro').length,
                echoproplusUsers: paidUsers.filter(user => user.plan === 'echoproplus').length
            },
            expiringSoon: expiringSoon.map(user => ({
                uid: user.uid,
                username: user.username,
                email: user.email,
                plan: user.plan,
                planExpiry: user.planExpiry,
                daysUntilExpiry: Math.ceil((user.planExpiry - currentDate) / (1000 * 60 * 60 * 24))
            }))
        };

    } catch (error) {
        console.error('Get Expiry Statistics Error:', error.message);
        return {
            success: false,
            message: 'Error getting expiry statistics',
            error: error.message
        };
    }
};

module.exports = { autoExpiryCheck, getExpiryStatistics }; 