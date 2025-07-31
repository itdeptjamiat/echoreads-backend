const { autoExpiryCheck } = require('./autoExpiryCheck');

const triggerAutoExpiry = async (req, res) => {
    try {
        // This route is for automated processes and doesn't require admin authentication
        // It can be called by cron jobs, schedulers, or automated systems
        
        console.log(`[${new Date().toISOString()}] Auto expiry check triggered via API`);
        
        const result = await autoExpiryCheck();
        
        res.status(200).json({
            success: true,
            message: 'Automatic expiry check completed',
            result: result
        });

    } catch (error) {
        console.error('Auto Expiry Route Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = triggerAutoExpiry; 