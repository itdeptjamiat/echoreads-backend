const Feedback = require('../models/feedbackSchema');

const getAllFeedback = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            category,
            startDate,
            endDate,
            email,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (category) {
            filter.category = category;
        }

        if (email) {
            filter.email = { $regex: email, $options: 'i' }; // Case insensitive search
        }

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Pagination
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // Sort order
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get feedback with pagination
        const feedback = await Feedback.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNumber)
            .exec();

        // Get total count for pagination
        const totalCount = await Feedback.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limitNumber);

        // Response
        return res.status(200).json({
            success: true,
            message: 'Feedback retrieved successfully',
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
        console.error('Get All Feedback Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later.'
        });
    }
};

module.exports = getAllFeedback; 