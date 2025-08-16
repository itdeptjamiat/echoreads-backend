const Magzines = require('../models/magzinesSchema');

/**
 * Get recommended digests based on views, likes, downloads, reads, and rating
 * GET /api/v1/user/recommended-digests
 */
const getRecommendedDigests = async (req, res) => {
    try {
        // Simple query for digests only
        const query = {
            isActive: true,
            magzineType: 'digest'
        };

        // Get recommended digests sorted by popularity (downloads, views, likes)
        const digests = await Magzines.find(query)
            .select('mid name image file type fileType magzineType category description downloads views likes reads rating createdAt audioFile')
            .sort({ downloads: -1, views: -1, likes: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            message: `Found ${digests.length} recommended digests`,
            data: digests
        });

    } catch (error) {
        console.error('Error getting recommended digests:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching recommended digests'
        });
    }
};

module.exports = getRecommendedDigests;