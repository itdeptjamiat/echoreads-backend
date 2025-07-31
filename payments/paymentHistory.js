const Account = require('../models/accountCreate');
const PlanPrice = require('../models/planPriceSchema');

const getPaymentHistory = async (req, res) => {
    try {
        const { adminUid } = req.body;

        if (!adminUid) {
            return res.status(400).json({ 
                success: false,
                message: 'Admin User ID (adminUid) is required' 
            });
        }

        // Verify admin authorization
        const admin = await Account.findOne({ uid: adminUid });
        if (!admin) {
            return res.status(404).json({ 
                success: false,
                message: 'Admin user not found' 
            });
        }

        if (admin.userType !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'You are not authorized to view payment history' 
            });
        }

        // Get all paid users (excluding free users)
        const paidUsers = await Account.find({
            plan: { $in: ['echopro', 'echoproplus'] },
            planStart: { $exists: true }
        }).select('uid username email plan planStart planExpiry userType createdAt');

        // Get current plan prices
        const plans = await PlanPrice.find({ isActive: true });

        // Calculate revenue and statistics
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        let yearlyRevenue = 0;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const paymentDetails = paidUsers.map(user => {
            // Find plan price for this user's plan
            const userPlan = plans.find(plan => plan.planType === user.plan);
            const planPrice = userPlan ? userPlan.price : 0;
            
            // Calculate revenue for this user
            const userRevenue = planPrice;
            totalRevenue += userRevenue;

            // Check if this is current month/year revenue
            const planStartDate = new Date(user.planStart);
            if (planStartDate.getMonth() === currentMonth && planStartDate.getFullYear() === currentYear) {
                monthlyRevenue += userRevenue;
            }
            if (planStartDate.getFullYear() === currentYear) {
                yearlyRevenue += userRevenue;
            }

            return {
                uid: user.uid,
                username: user.username,
                email: user.email,
                plan: user.plan,
                planPrice: planPrice,
                planStart: user.planStart,
                planExpiry: user.planExpiry,
                isActive: user.planExpiry ? currentDate < user.planExpiry : true,
                revenue: userRevenue,
                createdAt: user.createdAt
            };
        });

        // Group by plan type
        const planStats = {
            echopro: {
                count: paidUsers.filter(user => user.plan === 'echopro').length,
                revenue: paymentDetails.filter(p => p.plan === 'echopro').reduce((sum, p) => sum + p.revenue, 0)
            },
            echoproplus: {
                count: paidUsers.filter(user => user.plan === 'echoproplus').length,
                revenue: paymentDetails.filter(p => p.plan === 'echoproplus').reduce((sum, p) => sum + p.revenue, 0)
            }
        };

        // Get active vs expired subscriptions
        const activeSubscriptions = paymentDetails.filter(p => p.isActive);
        const expiredSubscriptions = paymentDetails.filter(p => !p.isActive);

        // Calculate average revenue per user
        const avgRevenuePerUser = paidUsers.length > 0 ? totalRevenue / paidUsers.length : 0;

        // Prepare comprehensive payment history
        const paymentHistory = {
            success: true,
            revenueStats: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
                yearlyRevenue: Math.round(yearlyRevenue * 100) / 100,
                averageRevenuePerUser: Math.round(avgRevenuePerUser * 100) / 100
            },
            subscriptionStats: {
                totalPaidUsers: paidUsers.length,
                activeSubscriptions: activeSubscriptions.length,
                expiredSubscriptions: expiredSubscriptions.length,
                planBreakdown: planStats
            },
            userList: paymentDetails.sort((a, b) => new Date(b.planStart) - new Date(a.planStart)),
            recentPayments: paymentDetails
                .filter(p => {
                    const planStart = new Date(p.planStart);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return planStart >= thirtyDaysAgo;
                })
                .sort((a, b) => new Date(b.planStart) - new Date(a.planStart))
                .slice(0, 10),
            monthlyTrends: {
                currentMonth: currentMonth + 1,
                currentYear: currentYear,
                monthlyRevenue: Math.round(monthlyRevenue * 100) / 100
            }
        };

        res.status(200).json(paymentHistory);

    } catch (error) {
        console.error('Get Payment History Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = getPaymentHistory; 