const PlanPrice = require('../models/planPriceSchema');

const createPlan = async (req, res) => {
    try {
        // Validate input
        const { 
            planType, 
            price, 
            currency = 'USD', 
            duration = 1, 
            features = [], 
            maxDownloads = 0, 
            maxMagazines = 0, 
            description = '',
            discountPercentage = 0,
            discountValidUntil = null
        } = req.body;
        
        if (!planType || price === undefined) {
            return res.status(400).json({ 
                message: 'Missing required fields: planType and price are required.' 
            });
        }

        // Validate that 'planType' is one of the allowed values
        const allowedPlanTypes = ['free', 'echopro', 'echoproplus'];
        if (!allowedPlanTypes.includes(planType)) {
            return res.status(400).json({ 
                message: 'Invalid planType. Must be one of: "free", "echopro", "echoproplus".' 
            });
        }

        // Check if plan already exists
        const existingPlan = await PlanPrice.findOne({ planType });
        if (existingPlan) {
            return res.status(400).json({ 
                message: `Plan type "${planType}" already exists. Use update instead.` 
            });
        }

        // Validate price for free plan
        if (planType === 'free' && price !== 0) {
            return res.status(400).json({ 
                message: 'Free plan must have price set to 0.' 
            });
        }

        // Validate discount percentage
        if (discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({ 
                message: 'Discount percentage must be between 0 and 100.' 
            });
        }

        // Create new plan
        const plan = new PlanPrice({
            planType,
            price,
            currency,
            duration,
            features,
            maxDownloads,
            maxMagazines,
            description,
            discountPercentage,
            discountValidUntil: discountValidUntil ? new Date(discountValidUntil) : null,
            isActive: true
        });

        await plan.save();
        
        res.status(201).json({ 
            message: 'Plan created successfully', 
            plan: plan 
        });

    } catch (error) {
        console.error("Error creating plan:", error);
        // Check for specific Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = createPlan; 