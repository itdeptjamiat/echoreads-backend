const Magzines = require('../models/magzinesSchema');

/**
 * Add read to magazine/article/digest
 * POST /api/v1/user/add-read
 * Body: { mid, userId, readDuration }
 */
const addRead = async (req, res) => {
    try {
        const { mid, userId, readDuration = 0 } = req.body;

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
        const numericReadDuration = Number(readDuration);

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

        // Check if user already read this content
        const existingRead = magazine.readBy.find(read => read.userId === numericUserId);

        let updateData;
        let action;

        if (existingRead) {
            // Update existing read: Update read duration and timestamp
            updateData = {
                $set: {
                    'readBy.$.readAt': new Date(),
                    'readBy.$.readDuration': Math.max(existingRead.readDuration, numericReadDuration)
                }
            };
            action = 'updated';
        } else {
            // New read: Add user to readBy array and increment reads count
            updateData = {
                $push: {
                    readBy: {
                        userId: numericUserId,
                        readAt: new Date(),
                        readDuration: numericReadDuration
                    }
                },
                $inc: { reads: 1 }
            };
            action = 'added';
        }

        // Update the magazine
        const updatedMagazine = await Magzines.findOneAndUpdate(
            existingRead
                ? { mid: numericMid, 'readBy.userId': numericUserId }
                : { mid: numericMid },
            updateData,
            { new: true, select: 'mid name magzineType reads readBy' }
        );

        // Get user's read data
        const userRead = updatedMagazine.readBy.find(read => read.userId === numericUserId);

        // Response
        res.status(200).json({
            success: true,
            message: `Read ${action} successfully for ${updatedMagazine.magzineType}`,
            data: {
                mid: updatedMagazine.mid,
                name: updatedMagazine.name,
                type: updatedMagazine.magzineType,
                totalReads: updatedMagazine.reads,
                uniqueReaders: updatedMagazine.readBy.length,
                userReadDuration: userRead.readDuration,
                action: action,
                readAt: userRead.readAt
            }
        });

    } catch (error) {
        console.error('Error adding/updating read:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while processing read'
        });
    }
};

module.exports = addRead; 