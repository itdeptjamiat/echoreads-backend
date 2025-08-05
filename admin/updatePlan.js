const PlanPrice = require('../models/planPriceSchema');

const updatePlan = async (req, res) => {
    try {
        const { planType, ...updateData } = req.body;

        if (!planType) {
            return res.status(400).json({ message: 'Plan type is required' });
        }

        // Validate planType if provided in updateData
        if (updateData.planType) {
            const allowedPlanTypes = ['free', 'echopro', 'echoproplus'];
            if (!allowedPlanTypes.includes(updateData.planType)) {
                return res.status(400).json({ 
                    message: 'Invalid planType. Must be one of: "free", "echopro", "echoproplus".' 
                });
            }
        }

        // Validate price for free plan
        if (updateData.price !== undefined) {
            if (planType === 'free' && updateData.price !== 0) {
                return res.status(400).json({ 
                    message: 'Free plan must have price set to 0.' 
                });
            }
        }

        // Validate discount percentage
        if (updateData.discountPercentage !== undefined) {
            if (updateData.discountPercentage < 0 || updateData.discountPercentage > 100) {
                return res.status(400).json({ 
                    message: 'Discount percentage must be between 0 and 100.' 
                });
            }
        }

        // Handle discount expiry date
        if (updateData.discountValidUntil) {
            updateData.discountValidUntil = new Date(updateData.discountValidUntil);
        }

        const updatedPlan = await PlanPrice.findOneAndUpdate(
            { planType },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        res.status(200).json({
            message: 'Plan updated successfully',
            plan: updatedPlan
        });
    } catch (error) {
        console.error('Update Plan Error:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = updatePlan;

/*
Example request body for Postman testing:

1. Update EchoPro Plan:
{
    "planType": "echopro",
    "price": 99.99,
    "description": "Premium access to EchoReads magazines",
    "features": [
        "Access to premium magazines",
        "Ad-free reading experience",
        "Download up to 20 magazines per month"
    ],
    "durationInDays": 30,
    "discountPercentage": 20,
    "discountValidUntil": "2024-12-31T23:59:59Z"
}

2. Update Free Plan:
{
    "planType": "free",
    "price": 0,
    "description": "Basic access to EchoReads",
    "features": [
        "Access to basic magazines",
        "Limited downloads per month",
        "Ad-supported reading"
    ],
    "durationInDays": 30
}

3. Update EchoProPlus Plan:
{
    "planType": "echoproplus",
    "price": 199.99,
    "description": "Ultimate access to EchoReads magazines",
    "features": [
        "Unlimited magazine access",
        "Priority customer support",
        "Exclusive content access",
        "Unlimited downloads"
    ],
    "durationInDays": 365,
    "discountPercentage": 15,
    "discountValidUntil": "2024-12-31T23:59:59Z"
}
*/