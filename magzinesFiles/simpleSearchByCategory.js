const Magzines = require('../models/magzinesSchema');

/**
 * Simple search magazines by keyword
 * GET /api/v1/user/search-category?category=sports
 */
const simpleSearchByCategory = async (req, res) => {
    try {
        const { category } = req.query;

        // Validate category parameter
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        // Search magazines by keyword
        const magazines = await Magzines.find({
            category: { $regex: category, $options: 'i' },
            isActive: true
        })
            .select('mid name image file type fileType magzineType category description downloads rating createdAt audioFile')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: magazines.length > 0
                ? `Found ${magazines.length} magazines for category: ${category}`
                : `No magazines found for category: ${category}`,
            data: magazines
        });

    } catch (error) {
        console.error('Error searching by category:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while searching magazines'
        });
    }
};

module.exports = simpleSearchByCategory;