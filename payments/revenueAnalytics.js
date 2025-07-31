const Account = require('../models/accountCreate');
const PlanPrice = require('../models/planPriceSchema');

const getRevenueAnalytics = async (req, res) => {
    try {
        const { adminUid, period = 'all' } = req.body;

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
                message: 'You are not authorized to view revenue analytics' 
            });
        }

        // Get all paid users
        const paidUsers = await Account.find({
            plan: { $in: ['echopro', 'echoproplus'] },
            planStart: { $exists: true }
        }).select('uid username email plan planStart planExpiry userType createdAt');

        // Get current plan prices
        const plans = await PlanPrice.find({ isActive: true });

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // Calculate monthly revenue for the last 12 months
        const monthlyRevenue = [];
        for (let i = 11; i >= 0; i--) {
            const targetMonth = new Date(currentYear, currentMonth - i, 1);
            const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
            const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

            let monthRevenue = 0;
            let monthUsers = 0;

            paidUsers.forEach(user => {
                const planStart = new Date(user.planStart);
                if (planStart >= monthStart && planStart <= monthEnd) {
                    const userPlan = plans.find(plan => plan.planType === user.plan);
                    const planPrice = userPlan ? userPlan.price : 0;
                    monthRevenue += planPrice;
                    monthUsers++;
                }
            });

            monthlyRevenue.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                revenue: Math.round(monthRevenue * 100) / 100,
                users: monthUsers,
                year: monthStart.getFullYear(),
                monthNumber: monthStart.getMonth() + 1
            });
        }

        // Calculate plan performance
        const planPerformance = {
            echopro: {
                totalUsers: paidUsers.filter(user => user.plan === 'echopro').length,
                activeUsers: paidUsers.filter(user => {
                    if (user.plan !== 'echopro') return false;
                    return user.planExpiry ? currentDate < user.planExpiry : true;
                }).length,
                revenue: paidUsers.filter(user => user.plan === 'echopro').reduce((sum, user) => {
                    const userPlan = plans.find(plan => plan.planType === user.plan);
                    return sum + (userPlan ? userPlan.price : 0);
                }, 0)
            },
            echoproplus: {
                totalUsers: paidUsers.filter(user => user.plan === 'echoproplus').length,
                activeUsers: paidUsers.filter(user => {
                    if (user.plan !== 'echoproplus') return false;
                    return user.planExpiry ? currentDate < user.planExpiry : true;
                }).length,
                revenue: paidUsers.filter(user => user.plan === 'echoproplus').reduce((sum, user) => {
                    const userPlan = plans.find(plan => plan.planType === user.plan);
                    return sum + (userPlan ? userPlan.price : 0);
                }, 0)
            }
        };

        // Calculate growth metrics
        const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
        const currentMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1].revenue;
        const previousMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2].revenue;
        const revenueGrowth = previousMonthRevenue > 0 ? 
            ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

        // Calculate user retention
        const totalActiveUsers = paidUsers.filter(user => {
            return user.planExpiry ? currentDate < user.planExpiry : true;
        }).length;
        const retentionRate = paidUsers.length > 0 ? (totalActiveUsers / paidUsers.length) * 100 : 0;

        // Prepare analytics response
        const analytics = {
            success: true,
            overview: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalPaidUsers: paidUsers.length,
                activeSubscriptions: totalActiveUsers,
                retentionRate: Math.round(retentionRate * 100) / 100,
                averageRevenuePerUser: paidUsers.length > 0 ? Math.round(totalRevenue / paidUsers.length * 100) / 100 : 0
            },
            trends: {
                monthlyRevenue: monthlyRevenue,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                currentMonthRevenue: currentMonthRevenue,
                previousMonthRevenue: previousMonthRevenue
            },
            planPerformance: {
                echopro: {
                    ...planPerformance.echopro,
                    revenue: Math.round(planPerformance.echopro.revenue * 100) / 100,
                    conversionRate: paidUsers.length > 0 ? Math.round((planPerformance.echopro.totalUsers / paidUsers.length) * 100) / 100 : 0
                },
                echoproplus: {
                    ...planPerformance.echoproplus,
                    revenue: Math.round(planPerformance.echoproplus.revenue * 100) / 100,
                    conversionRate: paidUsers.length > 0 ? Math.round((planPerformance.echoproplus.totalUsers / paidUsers.length) * 100) / 100 : 0
                }
            },
            insights: {
                topPerformingMonth: monthlyRevenue.reduce((max, month) => 
                    month.revenue > max.revenue ? month : max, monthlyRevenue[0]),
                growthTrend: revenueGrowth > 0 ? 'positive' : revenueGrowth < 0 ? 'negative' : 'stable',
                recommendedFocus: planPerformance.echopro.revenue > planPerformance.echoproplus.revenue ? 
                    'echopro' : 'echoproplus'
            }
        };

        res.status(200).json(analytics);

    } catch (error) {
        console.error('Get Revenue Analytics Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = getRevenueAnalytics; 