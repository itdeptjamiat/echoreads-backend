const Magzines = require('../models/magzinesSchema');

/**
 * Get recommended magazines based on views, likes, downloads, reads
 * GET /api/v1/user/recommended-magazines
 */
const getRecommendedMagazines = async (req, res) => {
    try {
        // Simple query for magazines only
        const query = {
            isActive: true,
            magzineType: 'magzine'
        };

        // Get recommended magazines sorted by popularity (downloads, views, likes)
        const magazines = await Magzines.find(query)
            .select('mid name image file type fileType magzineType category description downloads views likes reads rating createdAt audioFile')
            .sort({ downloads: -1, views: -1, likes: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            message: `Found ${magazines.length} recommended magazines`,
            data: magazines
        });

    } catch (error) {
        console.error('Error getting recommended magazines:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching recommended magazines'
        });
    }
};

module.exports = getRecommendedMagazines;