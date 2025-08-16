const Feedback = require('../models/feedbackSchema');

const getUserFeedback = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        // Build filter object
        const filter = {};

        if (userId) {
            filter.userId = parseInt(userId);
        } else {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        // Add status filter if provided
        if (status) {
            filter.status = status;
        }

        // Pagination
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // Get user feedback with pagination
        const feedback = await Feedback.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .exec();

        // Get total count for pagination
        const totalCount = await Feedback.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limitNumber);

        // Response
        return res.status(200).json({
            success: true,
            message: 'User feedback retrieved successfully',
            data: {
                feedback,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalCount,
                    hasNextPage: pageNumber < totalPages,
                    hasPrevPage: pageNumber > 1,
                    limit: limitNumber
                }
            }
        });

    } catch (error) {
        console.error('Get User Feedback Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later.'
        });
    }
};

module.exports = getUserFeedback; 