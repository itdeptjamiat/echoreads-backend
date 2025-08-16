const Magzines = require('../models/magzinesSchema');

/**
 * Get recommended articles based on views, likes, downloads, reads
 * GET /api/v1/user/recommended-articles
 */
const getRecommendedArticles = async (req, res) => {
    try {
        // Simple query for articles only
        const query = {
            isActive: true,
            magzineType: 'article'
        };

        // Get recommended articles sorted by popularity (downloads, views, likes)
        const articles = await Magzines.find(query)
            .select('mid name image file type fileType magzineType category description downloads views likes reads rating createdAt audioFile')
            .sort({ downloads: -1, views: -1, likes: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            message: `Found ${articles.length} recommended articles`,
            data: articles
        });

    } catch (error) {
        console.error('Error getting recommended articles:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching recommended articles'
        });
    }
};

module.exports = getRecommendedArticles;