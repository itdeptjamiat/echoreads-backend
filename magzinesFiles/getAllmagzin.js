const Magzines = require('../models/magzinesSchema');

const getAllMagzines = async (req, res) => {
    try {
        // Get query parameters for sorting and filtering
        const { sortBy = 'popularity', limit } = req.query;
        
        let sortCriteria = {};
        
        // Define sorting criteria based on popularity
        switch (sortBy) {
            case 'downloads':
                sortCriteria = { downloads: -1 }; // High to low downloads
                break;
            case 'rating':
                sortCriteria = { rating: -1 }; // High to low rating
                break;
            case 'popularity':
            default:
                // Combined popularity score: (downloads * 0.7) + (rating * 0.3)
                // This gives more weight to downloads but also considers ratings
                sortCriteria = { 
                    $expr: {
                        $add: [
                            { $multiply: ["$downloads", 0.7] },
                            { $multiply: ["$rating", 0.3] }
                        ]
                    }
                };
                break;
        }
        
        // Build query with active magazines only
        const query = { isActive: true };
        
        // Apply sorting and optional limit
        let magzinesQuery = Magzines.find(query).sort(sortCriteria);
        
        if (limit && !isNaN(parseInt(limit))) {
            magzinesQuery = magzinesQuery.limit(parseInt(limit));
        }
        
        const magzines = await magzinesQuery.exec();
        
        // If sorting by popularity (combined score), we need to sort in memory
        // since MongoDB doesn't support complex expressions in sort for all cases
        if (sortBy === 'popularity') {
            magzines.sort((a, b) => {
                const scoreA = (a.downloads * 0.7) + (a.rating * 0.3);
                const scoreB = (b.downloads * 0.7) + (b.rating * 0.3);
                return scoreB - scoreA; // High to low
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Magazines retrieved successfully',
            data: magzines,
            total: magzines.length,
            sortBy: sortBy
        });
        
    } catch (error) {
        console.log('Error fetching magazines:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
}

module.exports = getAllMagzines;