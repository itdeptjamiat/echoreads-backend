const Account = require('../models/accountCreate');
const Magzines = require('../models/magzinesSchema');

const getDownloadHistory = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ 
                success: false,
                message: 'User ID (uid) is required' 
            });
        }

        // Check if user exists
        const user = await Account.findOne({ uid });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Get all magazines that the user has access to based on their plan
        const userPlan = user.plan;
        let magazineQuery = { isActive: true };

        // Filter magazines based on user's plan
        if (userPlan === 'free') {
            // Free users can only see free magazines
            magazineQuery.type = 'free';
        } else if (userPlan === 'echopro') {
            // Pro users can see free and pro magazines
            magazineQuery.type = { $in: ['free', 'pro' ] };
        } else if (userPlan === 'echoproplus') {
            // Pro+ users can see all magazines
            magazineQuery.type = { $in: ['free', 'pro'] };
        }

        // If user is admin, they can see all magazines
        if (user.userType === 'admin') {
            magazineQuery = { isActive: true };
        }

        // Get magazines with download counts
        const magazines = await Magzines.find(magazineQuery)
            .select('mid name type category downloads rating description image createdAt')
            .sort({ downloads: -1, createdAt: -1 });

        // Prepare response with user info and accessible magazines
        const downloadHistory = {
            success: true,
            user: {
                uid: user.uid,
                username: user.username,
                plan: user.plan,
                userType: user.userType,
                planExpiry: user.planExpiry,
                isPlanActive: user.planExpiry ? new Date() < user.planExpiry : true
            },
            accessibleMagazines: magazines.map(magazine => ({
                mid: magazine.mid,
                name: magazine.name,
                type: magazine.type,
                category: magazine.category,
                downloads: magazine.downloads,
                rating: magazine.rating,
                description: magazine.description,
                image: magazine.image,
                createdAt: magazine.createdAt,
                canDownload: true
            })),
            totalAccessible: magazines.length,
            planLimits: {
                free: userPlan === 'free' ? 'Free magazines only' : 'All magazines',
                echopro: userPlan === 'echopro' ? 'Free + Pro magazines' : 'All magazines',
                echoproplus: userPlan === 'echoproplus' ? 'All magazines + Premium features' : 'All magazines'
            }
        };

        res.status(200).json(downloadHistory);

    } catch (error) {
        console.error('Get Download History Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = getDownloadHistory; 