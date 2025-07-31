const Account = require('../models/accountCreate');

// Daily scheduler function that runs automatically
const dailyExpiryCheck = async () => {
    try {
        const currentDate = new Date();
        console.log(`[${currentDate.toISOString()}] 🕐 Daily expiry check started...`);

        // Find all users with expired plans
        const expiredUsers = await Account.find({
            plan: { $in: ['echopro', 'echoproplus'] },
            planExpiry: { $lt: currentDate }
        });

        if (expiredUsers.length === 0) {
            console.log(`[${currentDate.toISOString()}] ✅ No expired subscriptions found today.`);
            return {
                success: true,
                message: 'No expired subscriptions found today',
                timestamp: currentDate.toISOString(),
                statistics: {
                    totalExpired: 0,
                    echoproExpired: 0,
                    echoproplusExpired: 0
                }
            };
        }

        console.log(`[${currentDate.toISOString()}] 🔍 Found ${expiredUsers.length} expired subscriptions.`);

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
            
            console.log(`[${currentDate.toISOString()}] 🔄 Updated user ${user.username} (UID: ${user.uid}) from ${user.plan} to free plan`);
            return updatedUser;
        });

        const updatedUsers = await Promise.all(updatePromises);

        // Get statistics
        const totalExpired = expiredUsers.length;
        const echoproExpired = expiredUsers.filter(user => user.plan === 'echopro').length;
        const echoproplusExpired = expiredUsers.filter(user => user.plan === 'echoproplus').length;

        const result = {
            success: true,
            message: `Daily check: Updated ${totalExpired} expired subscriptions to free plan`,
            timestamp: currentDate.toISOString(),
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
                updatedAt: currentDate.toISOString()
            }))
        };

        console.log(`[${currentDate.toISOString()}] ✅ Daily expiry check completed. Updated ${totalExpired} users.`);
        return result;

    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Daily Expiry Check Error:`, error.message);
        return {
            success: false,
            message: 'Error during daily expiry check',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// Function to start the daily scheduler
const startDailyScheduler = () => {
    console.log(`[${new Date().toISOString()}] 🚀 Starting daily expiry scheduler...`);
    
    // Run immediately on startup
    dailyExpiryCheck();
    
    // Set up daily interval (24 hours = 24 * 60 * 60 * 1000 milliseconds)
    const dailyInterval = 24 * 60 * 60 * 1000;
    
    setInterval(async () => {
        console.log(`[${new Date().toISOString()}] 📅 Running scheduled daily expiry check...`);
        await dailyExpiryCheck();
    }, dailyInterval);
    
    console.log(`[${new Date().toISOString()}] ✅ Daily scheduler started. Will run every 24 hours.`);
};

// Function to get scheduler status
const getSchedulerStatus = () => {
    return {
        success: true,
        message: 'Daily expiry scheduler is running',
        status: 'active',
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        lastRun: new Date().toISOString()
    };
};

// Function to manually trigger daily check (for testing)
const triggerDailyCheck = async () => {
    console.log(`[${new Date().toISOString()}] 🔧 Manual daily check triggered...`);
    return await dailyExpiryCheck();
};

module.exports = { 
    dailyExpiryCheck, 
    startDailyScheduler, 
    getSchedulerStatus, 
    triggerDailyCheck 
}; 