const Magzines = require('../models/magzinesSchema');
const Account = require('../models/accountCreate');

/**
 * Add view to magazine/article/digest
 * POST /api/v1/user/add-view
 * Body: { mid, userId }
 */
const addView = async (req, res) => {
    try {
        const { mid, userId } = req.body;

        // Validate required fields
        if (!mid) {
            return res.status(400).json({
                success: false,
                message: 'Magazine ID (mid) is required'
            });
        }

        // Convert mid to number
        const numericMid = Number(mid);
        if (isNaN(numericMid)) {
            return res.status(400).json({
                success: false,
                message: 'Magazine ID (mid) must be a valid number'
            });
        }

        // Find the magazine/article/digest
        const magazine = await Magzines.findOne({
            mid: numericMid,
            isActive: true
        });

        if (!magazine) {
            return res.status(404).json({
                success: false,
                message: 'Content not found or inactive'
            });
        }

        // Check user's plan and viewing limits for free users
        let user = null;
        let alreadyViewed = false;

        if (userId) {
            const numericUserId = Number(userId);
            if (!isNaN(numericUserId)) {
                // Get user details to check plan
                user = await Account.findOne({ uid: numericUserId });

                if (user) {
                    alreadyViewed = magazine.viewedBy.some(view => view.userId === numericUserId);

                    // Check viewing limits for free users
                    if (user.plan === 'free' && !alreadyViewed) {
                        // Count how many unique items of each type the user has viewed
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

                        // Check limits based on content type
                        const contentType = magazine.magzineType;
                        const limit = 5; // Free users can view 5 of each type

                        let currentCount = 0;
                        let typeLabel = '';

                        if (contentType === 'magzine') {
                            currentCount = userViewedMagazines;
                            typeLabel = 'magazines';
                        } else if (contentType === 'digest') {
                            currentCount = userViewedDigests;
                            typeLabel = 'digests';
                        } else if (contentType === 'article') {
                            currentCount = userViewedArticles;
                            typeLabel = 'articles';
                        }

                        // If user has reached the limit, deny access
                        if (currentCount >= limit) {
                            return res.status(403).json({
                                success: false,
                                message: `Free plan limit reached. You can only view ${limit} ${typeLabel}. Upgrade to EchoPro for unlimited access.`,
                                data: {
                                    currentCount: currentCount,
                                    limit: limit,
                                    contentType: typeLabel,
                                    userPlan: 'free',
                                    upgradeRequired: true
                                }
                            });
                        }
                    }
                }
            }
        }

        // Update view count and tracking
        const updateData = {
            $inc: { views: 1 } // Always increment view count
        };

        // Add user to viewedBy array if userId is provided and user hasn't viewed before
        if (userId && !alreadyViewed) {
            const numericUserId = Number(userId);
            if (!isNaN(numericUserId)) {
                updateData.$push = {
                    viewedBy: {
                        userId: numericUserId,
                        viewedAt: new Date()
                    }
                };
            }
        }

        // Update the magazine
        const updatedMagazine = await Magzines.findOneAndUpdate(
            { mid: numericMid },
            updateData,
            { new: true, select: 'mid name magzineType views viewedBy' }
        );

        // Get user's viewing statistics for response (only if user is authenticated)
        let userStats = null;
        if (user && user.plan === 'free') {
            const userViewedMagazines = await Magzines.countDocuments({
                isActive: true,
                magzineType: 'magzine',
                'viewedBy.userId': Number(userId)
            });

            const userViewedDigests = await Magzines.countDocuments({
                isActive: true,
                magzineType: 'digest',
                'viewedBy.userId': Number(userId)
            });

            const userViewedArticles = await Magzines.countDocuments({
                isActive: true,
                magzineType: 'article',
                'viewedBy.userId': Number(userId)
            });

            userStats = {
                plan: 'free',
                viewingLimits: {
                    magazines: {
                        viewed: userViewedMagazines,
                        limit: 5,
                        remaining: Math.max(0, 5 - userViewedMagazines)
                    },
                    digests: {
                        viewed: userViewedDigests,
                        limit: 5,
                        remaining: Math.max(0, 5 - userViewedDigests)
                    },
                    articles: {
                        viewed: userViewedArticles,
                        limit: 5,
                        remaining: Math.max(0, 5 - userViewedArticles)
                    }
                }
            };
        }

        // Response
        res.status(200).json({
            success: true,
            message: `View added successfully to ${updatedMagazine.magzineType}`,
            data: {
                mid: updatedMagazine.mid,
                name: updatedMagazine.name,
                type: updatedMagazine.magzineType,
                totalViews: updatedMagazine.views,
                uniqueViewers: updatedMagazine.viewedBy.length,
                userViewed: userId ? !alreadyViewed : false,
                viewedAt: new Date(),
                userStats: userStats
            }
        });

    } catch (error) {
        console.error('Error adding view:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while adding view'
        });
    }
};

module.exports = addView; 