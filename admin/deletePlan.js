const PlanPrice = require('../models/planPriceSchema');
const Account = require('../models/accountCreate');

const deletePlan = async (req, res) => {
    try {
        const { planType, uid } = req.body;

        if (!planType) {
            return res.status(400).json({ message: 'Plan type is required' });
        }
        if (!uid) {
            return res.status(400).json({ message: 'User ID (uid) is required' });
        }

        // Verify admin authorization
        const admin = await Account.findOne({ uid });
        if (!admin) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (admin.userType !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete plans' });
        }

        // Check if plan exists
        const plan = await PlanPrice.findOne({ planType });

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Prevent deletion of free plan (it's essential)
        if (planType === 'free') {
            return res.status(400).json({ 
                message: 'Cannot delete the free plan as it is essential for the application' 
            });
        }

        // Check if any users are currently on this plan
        const usersOnPlan = await Account.countDocuments({ plan: planType });
        if (usersOnPlan > 0) {
            return res.status(400).json({ 
                message: `Cannot delete plan "${planType}" as ${usersOnPlan} user(s) are currently subscribed to it. Please migrate users to another plan first.` 
            });
        }

        await PlanPrice.deleteOne({ planType });

        return res.status(200).json({ 
            message: `Plan "${planType}" deleted successfully` 
        });
    } catch (error) {
        console.error('Delete Plan Error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = deletePlan; 