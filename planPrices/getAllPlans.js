const PlanPrice = require('../models/planPriceSchema');

const getAllPlans = async (req, res) => {
    try {
        // Get all active plans by default, or all plans if specified
        const { includeInactive = false } = req.query;
        
        let query = {};
        if (!includeInactive) {
            query.isActive = true;
        }

        const plans = await PlanPrice.find(query).sort({ price: 1 });

        // Format the response to include calculated fields
        const formattedPlans = plans.map(plan => {
            const planObj = plan.toObject();
            
            // Calculate discounted price if discount is active
            let finalPrice = plan.price;
            if (plan.discountPercentage > 0 && plan.discountValidUntil) {
                const now = new Date();
                if (now < plan.discountValidUntil) {
                    finalPrice = plan.price * (1 - plan.discountPercentage / 100);
                }
            }
            
            return {
                ...planObj,
                finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimal places
                hasActiveDiscount: plan.discountPercentage > 0 && 
                                 plan.discountValidUntil && 
                                 new Date() < plan.discountValidUntil
            };
        });

        res.status(200).json({
            success: true,
            count: formattedPlans.length,
            plans: formattedPlans
        });
    } catch (error) {
        console.error('Get All Plans Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
}

module.exports = getAllPlans; 