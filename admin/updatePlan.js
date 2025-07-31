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