const Magzines = require('../models/magzinesSchema');

/**
 * Add/Remove like to magazine/article/digest (toggle functionality)
 * POST /api/v1/user/add-like
 * Body: { mid, userId }
 */
const addLike = async (req, res) => {
    try {
        const { mid, userId } = req.body;

        // Validate required fields
        if (!mid || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Magazine ID (mid) and User ID (userId) are required'
            });
        }

        // Convert to numbers
        const numericMid = Number(mid);
        const numericUserId = Number(userId);

        if (isNaN(numericMid) || isNaN(numericUserId)) {
            return res.status(400).json({
                success: false,
                message: 'Magazine ID and User ID must be valid numbers'
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

        // Check if user already liked this content
        const alreadyLiked = magazine.likedBy.some(like => like.userId === numericUserId);

        let updateData;
        let action;

        if (alreadyLiked) {
            // Unlike: Remove user from likedBy array and decrement likes count
            updateData = {
                $pull: { likedBy: { userId: numericUserId } },
                $inc: { likes: -1 }
            };
            action = 'removed';
        } else {
            // Like: Add user to likedBy array and increment likes count
            updateData = {
                $push: {
                    likedBy: {
                        userId: numericUserId,
                        likedAt: new Date()
                    }
                },
                $inc: { likes: 1 }
            };
            action = 'added';
        }

        // Update the magazine
        const updatedMagazine = await Magzines.findOneAndUpdate(
            { mid: numericMid },
            updateData,
            { new: true, select: 'mid name magzineType likes likedBy' }
        );

        // Response
        res.status(200).json({
            success: true,
            message: `Like ${action} successfully for ${updatedMagazine.magzineType}`,
            data: {
                mid: updatedMagazine.mid,
                name: updatedMagazine.name,
                type: updatedMagazine.magzineType,
                totalLikes: updatedMagazine.likes,
                userLiked: action === 'added',
                action: action,
                likedAt: action === 'added' ? new Date() : null
            }
        });

    } catch (error) {
        console.error('Error adding/removing like:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while processing like'
        });
    }
};

module.exports = addLike; 