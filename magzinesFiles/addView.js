const Magzines = require('../models/magzinesSchema');

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

        // Check if user already viewed this content (to avoid duplicate views from same user)
        let alreadyViewed = false;
        if (userId) {
            const numericUserId = Number(userId);
            if (!isNaN(numericUserId)) {
                alreadyViewed = magazine.viewedBy.some(view => view.userId === numericUserId);
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
                viewedAt: new Date()
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