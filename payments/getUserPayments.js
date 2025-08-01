const Payment = require('../models/paymentSchema');
const Account = require('../models/accountCreate');

const getUserPayments = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 10, page = 1 } = req.query;

        // Validate user exists
        const user = await Account.findOne({ uid: parseInt(userId) });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Build query
        const query = { userId: parseInt(userId) };
        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get payments with pagination
        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('planId', 'planType price duration features');

        // Get total count for pagination
        const totalPayments = await Payment.countDocuments(query);

        // Calculate payment statistics for this user
        const userStats = await Payment.aggregate([
            { $match: { userId: parseInt(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate total spent
        const totalSpent = await Payment.aggregate([
            { 
                $match: { 
                    userId: parseInt(userId),
                    status: 'completed'
                } 
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Format response
        const formattedPayments = payments.map(payment => ({
            paymentId: payment.paymentId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            provider: payment.provider,
            planType: payment.planType,
            planDuration: payment.planDuration,
            discountApplied: payment.discountApplied,
            taxAmount: payment.taxAmount,
            processingFee: payment.processingFee,
            totalAmount: payment.totalAmount,
            netAmount: payment.netAmount,
            createdAt: payment.createdAt,
            completedAt: payment.completedAt,
            plan: payment.planId
        }));

        const response = {
            success: true,
            user: {
                uid: user.uid,
                username: user.username,
                email: user.email,
                currentPlan: user.plan,
                planExpiry: user.planExpiry
            },
            payments: formattedPayments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPayments / parseInt(limit)),
                totalPayments,
                hasNextPage: skip + payments.length < totalPayments,
                hasPrevPage: parseInt(page) > 1
            },
            statistics: {
                totalSpent: totalSpent.length > 0 ? totalSpent[0].totalAmount : 0,
                paymentStats: userStats.reduce((acc, stat) => {
                    acc[stat._id] = {
                        count: stat.count,
                        totalAmount: stat.totalAmount
                    };
                    return acc;
                }, {})
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Get User Payments Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = getUserPayments; 