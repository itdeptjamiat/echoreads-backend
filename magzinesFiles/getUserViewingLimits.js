const Magzines = require('../models/magzinesSchema');
const Account = require('../models/accountCreate');

/**
 * Get user's viewing limits and current usage
 * GET /api/v1/user/viewing-limits/:userId
 */
const getUserViewingLimits = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate required fields
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Convert userId to number
        const numericUserId = Number(userId);
        if (isNaN(numericUserId)) {
            return res.status(400).json({
                success: false,
                message: 'User ID must be a valid number'
            });
        }

        // Get user details
        const user = await Account.findOne({ uid: numericUserId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // For pro and pro+ users, no limits
        if (user.plan === 'echopro' || user.plan === 'echoproplus') {
            return res.status(200).json({
                success: true,
                message: 'User has unlimited viewing access',
                data: {
                    plan: user.plan,
                    unlimited: true,
                    viewingLimits: {
                        magazines: { unlimited: true },
                        digests: { unlimited: true },
                        articles: { unlimited: true }
                    }
                }
            });
        }

        // For free users, calculate current usage
        const userViewedMagazines = await Magzines.countDocuments({
            isActive: true,
            magzineType: 'magzine',
            'viewedBy.userId': numericUserId
        });

        const userViewedDigests = await Magzines.countDocuments({
            isActive: true,
            magzineType: 'digest',
            'viewedBy.userId': numericUserId
        });

        const userViewedArticles = await Magzines.countDocuments({
            isActive: true,
            magzineType: 'article',
            'viewedBy.userId': numericUserId
        });

        const limit = 5; // Free users can view 5 of each type

        // Response
        res.status(200).json({
            success: true,
            message: 'User viewing limits retrieved successfully',
            data: {
                plan: user.plan,
                unlimited: false,
                viewingLimits: {
                    magazines: {
                        viewed: userViewedMagazines,
                        limit: limit,
                        remaining: Math.max(0, limit - userViewedMagazines),
                        reachedLimit: userViewedMagazines >= limit
                    },
                    digests: {
                        viewed: userViewedDigests,
                        limit: limit,
                        remaining: Math.max(0, limit - userViewedDigests),
                        reachedLimit: userViewedDigests >= limit
                    },
                    articles: {
                        viewed: userViewedArticles,
                        limit: limit,
                        remaining: Math.max(0, limit - userViewedArticles),
                        reachedLimit: userViewedArticles >= limit
                    }
                },
                totalViewed: userViewedMagazines + userViewedDigests + userViewedArticles,
                totalLimit: limit * 3,
                upgradeMessage: "Upgrade to EchoPro for unlimited access to all content"
            }
        });

    } catch (error) {
        console.error('Error getting user viewing limits:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching viewing limits'
        });
    }
};

module.exports = getUserViewingLimits; 