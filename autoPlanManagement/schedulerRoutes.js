const { dailyExpiryCheck, getSchedulerStatus, triggerDailyCheck } = require('./dailyScheduler');

// Route to get scheduler status
const getSchedulerStatusRoute = async (req, res) => {
    try {
        const status = getSchedulerStatus();
        res.status(200).json(status);
    } catch (error) {
        console.error('Get Scheduler Status Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

// Route to manually trigger daily check
const triggerDailyCheckRoute = async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] 🔧 Manual daily check triggered via API`);
        const result = await triggerDailyCheck();
        res.status(200).json({
            success: true,
            message: 'Manual daily check completed',
            result: result
        });
    } catch (error) {
        console.error('Trigger Daily Check Route Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

// Route to run daily check immediately
const runDailyCheckRoute = async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] 🚀 Daily check triggered via API`);
        const result = await dailyExpiryCheck();
        res.status(200).json({
            success: true,
            message: 'Daily check completed',
            result: result
        });
    } catch (error) {
        console.error('Run Daily Check Route Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = { 
    getSchedulerStatusRoute, 
    triggerDailyCheckRoute, 
    runDailyCheckRoute 
}; 