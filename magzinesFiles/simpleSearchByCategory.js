const Magzines = require('../models/magzinesSchema');

/**
 * Simple search magazines by category with query parameters
 * GET /api/v1/user/search-category
 * Query params: category, page, limit, sort, type
 */
const simpleSearchByCategory = async (req, res) => {
    try {
        const {
            category,
            page = 1,
            limit = 20,
            sort = 'newest',
            type = 'all',
            magzineType = 'all'
        } = req.query;

        // Validate category parameter
        if (!category || typeof category !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Category is required and must be a string'
            });
        }

        // Build search query
        let query = {
            category: { $regex: category, $options: 'i' },
            isActive: true
        };

        // Add type filter (free/pro)
        if (type && type !== 'all') {
            const validTypes = ['free', 'pro'];
            if (validTypes.includes(type.toLowerCase())) {
                query.type = type.toLowerCase();
            }
        }

        // Add magazine type filter (magzine/article/digest)
        if (magzineType && magzineType !== 'all') {
            const validMagzineTypes = ['magzine', 'article', 'digest'];
            if (validMagzineTypes.includes(magzineType.toLowerCase())) {
                query.magzineType = magzineType.toLowerCase();
            }
        }

        // Build sort query
        let sortQuery = {};
        switch (sort.toLowerCase()) {
            case 'newest':
                sortQuery = { createdAt: -1 };
                break;
            case 'oldest':
                sortQuery = { createdAt: 1 };
                break;
            case 'popular':
                sortQuery = { downloads: -1 };
                break;
            case 'rating':
                sortQuery = { rating: -1 };
                break;
            case 'name':
                sortQuery = { name: 1 };
                break;
            default:
                sortQuery = { createdAt: -1 };
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Validate pagination parameters
        if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100'
            });
        }

        // Get total count for pagination
        const totalMagazines = await Magzines.countDocuments(query);
        const totalPages = Math.ceil(totalMagazines / limitNum);

        // Search magazines with pagination and sorting
        const magazines = await Magzines.find(query)
            .select('mid name image file type fileType magzineType category description downloads rating createdAt audioFile')
            .sort(sortQuery)
            .skip(skip)
            .limit(limitNum);

        // Prepare response
        const response = {
            success: true,
            message: magazines.length > 0
                ? `Found ${magazines.length} magazines for category: ${category}`
                : `No magazines found for category: ${category}`,
            data: magazines,
            pagination: {
                currentPage: pageNum,
                totalPages: totalPages,
                totalItems: totalMagazines,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPreviousPage: pageNum > 1
            },
            filters: {
                category: category,
                type: type,
                magzineType: magzineType,
                sort: sort
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error in simple search by category:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while searching magazines'
        });
    }
};

module.exports = simpleSearchByCategory; 