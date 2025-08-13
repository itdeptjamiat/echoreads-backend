const Magzines = require('../models/magzinesSchema');
const Account = require('../models/accountCreate');

/**
 * Enhanced Home Screen API
 * Provides comprehensive data for magazines, articles, and digests
 */
const getHomeScreenData = async (req, res) => {
    try {
        // Get user info from token (you'll need to implement JWT middleware)
        const userId = req.user?.id || req.user?.uid; // Adjust based on your JWT structure
        
        // Get all active content
        const allContent = await Magzines.find({ isActive: true })
            .select('-__v')
            .sort({ createdAt: -1 });

        // Separate content by type
        const magazines = allContent.filter(item => item.magzineType === 'magzine');
        const articles = allContent.filter(item => item.magzineType === 'article');
        const digests = allContent.filter(item => item.magzineType === 'digest');

        // Get featured content (you can add featured field to schema later)
        const featured = {
            magazines: magazines.slice(0, 5), // Top 5 magazines
            articles: articles.slice(0, 5),   // Top 5 articles
            digests: digests.slice(0, 3)      // Top 3 digests
        };

        // Get trending content (based on downloads and ratings)
        const trending = {
            magazines: magazines
                .sort((a, b) => (b.downloads + b.rating) - (a.downloads + a.rating))
                .slice(0, 5),
            articles: articles
                .sort((a, b) => (b.downloads + b.rating) - (a.downloads + a.rating))
                .slice(0, 5),
            digests: digests
                .sort((a, b) => (b.downloads + b.rating) - (a.downloads + a.rating))
                .slice(0, 3)
        };

        // Get new releases (based on creation date)
        const newReleases = {
            magazines: magazines
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5),
            articles: articles
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5),
            digests: digests
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
        };

        // Get recommended content (simple recommendation based on user preferences)
        let recommended = {
            magazines: magazines.slice(0, 3),
            articles: articles.slice(0, 3),
            digests: digests.slice(0, 2)
        };

        // If user is logged in, try to get personalized recommendations
        if (userId) {
            try {
                const user = await Account.findById(userId);
                if (user) {
                    // Simple recommendation: show content from user's preferred categories
                    // You can enhance this with more sophisticated algorithms
                    const userCategories = ['technology', 'business', 'science']; // Default categories
                    
                    recommended = {
                        magazines: magazines
                            .filter(mag => userCategories.includes(mag.category))
                            .slice(0, 3),
                        articles: articles
                            .filter(art => userCategories.includes(art.category))
                            .slice(0, 3),
                        digests: digests
                            .filter(dig => userCategories.includes(dig.category))
                            .slice(0, 2)
                    };
                }
            } catch (userError) {
                console.log('User lookup error:', userError);
                // Continue with default recommendations
            }
        }

        // Get categories with counts
        const categoryCounts = {};
        allContent.forEach(item => {
            if (item.category) {
                categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            }
        });

        const categories = Object.keys(categoryCounts).map(category => ({
            id: category,
            name: category.charAt(0).toUpperCase() + category.slice(1),
            icon: getCategoryIcon(category),
            color: getCategoryColor(category),
            count: categoryCounts[category],
            featured: ['technology', 'business', 'science'].includes(category)
        }));

        // Get user stats (if logged in)
        let userStats = {
            totalMagazines: magazines.length,
            totalArticles: articles.length,
            totalDigests: digests.length,
            userReadCount: 0,
            userFavorites: 0
        };

        if (userId) {
            try {
                // You can implement reading progress tracking here
                // For now, using placeholder values
                userStats.userReadCount = Math.floor(Math.random() * 20) + 5;
                userStats.userFavorites = Math.floor(Math.random() * 10) + 2;
            } catch (statsError) {
                console.log('Stats calculation error:', statsError);
            }
        }

        // Prepare response
        const response = {
            success: true,
            message: 'Home screen data fetched successfully',
            data: {
                user: userId ? {
                    id: userId,
                    name: req.user?.name || 'User',
                    email: req.user?.email || '',
                    avatar: req.user?.profilePic || 'https://via.placeholder.com/150',
                    subscriptionType: req.user?.plan || 'free',
                    readingPreferences: ['technology', 'business', 'science']
                } : null,
                featured,
                trending,
                newReleases,
                recommended,
                categories,
                stats: userStats
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.log('Home screen data fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching home screen data'
        });
    }
};

/**
 * Get content by type with pagination and filtering
 */
const getContentByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { 
            page = 1, 
            limit = 20, 
            category, 
            sort = 'newest',
            filter = 'all' 
        } = req.query;

        // Validate content type
        const validTypes = ['magazines', 'articles', 'digests'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid content type. Must be magazines, articles, or digests'
            });
        }

        // Map type to magzineType
        const typeMap = {
            'magazines': 'magzine',
            'articles': 'article',
            'digests': 'digest'
        };

        // Build query
        let query = { 
            isActive: true, 
            magzineType: typeMap[type] 
        };

        if (category) {
            query.category = category;
        }

        if (filter !== 'all') {
            query.type = filter;
        }

        // Build sort
        let sortQuery = {};
        switch (sort) {
            case 'newest':
                sortQuery = { createdAt: -1 };
                break;
            case 'popular':
                sortQuery = { downloads: -1 };
                break;
            case 'rating':
                sortQuery = { rating: -1 };
                break;
            case 'downloads':
                sortQuery = { downloads: -1 };
                break;
            default:
                sortQuery = { createdAt: -1 };
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const content = await Magzines.find(query)
            .select('-__v')
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalItems = await Magzines.countDocuments(query);
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        // Get available categories and types for filters
        const categories = await Magzines.distinct('category', { 
            isActive: true, 
            magzineType: typeMap[type] 
        });

        const types = await Magzines.distinct('type', { 
            isActive: true, 
            magzineType: typeMap[type] 
        });

        // Get category counts
        const categoryCountPromises = categories.map(async (cat) => {
            const count = await Magzines.countDocuments({ 
                category: cat, 
                isActive: true, 
                magzineType: typeMap[type] 
            });
            return {
                id: cat,
                name: cat.charAt(0).toUpperCase() + cat.slice(1),
                count
            };
        });

        const categoriesWithCounts = await Promise.all(categoryCountPromises);

        // Get type counts
        const typeCountPromises = types.map(async (typeValue) => {
            const count = await Magzines.countDocuments({ 
                type: typeValue, 
                isActive: true, 
                magzineType: typeMap[type] 
            });
            return {
                type: typeValue,
                count
            };
        });

        const typesWithCounts = await Promise.all(typeCountPromises);

        // Prepare response
        const response = {
            success: true,
            message: 'Content fetched successfully',
            data: {
                content,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                },
                filters: {
                    categories: categoriesWithCounts,
                    types: typesWithCounts
                }
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.log('Content by type fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching content'
        });
    }
};

/**
 * Get all categories
 */
const getCategories = async (req, res) => {
    try {
        const categories = await Magzines.aggregate([
            { $match: { isActive: true } },
            { $group: { 
                _id: '$category', 
                count: { $sum: 1 },
                magazines: { 
                    $sum: { $cond: [{ $eq: ['$magzineType', 'magzine'] }, 1, 0] } 
                },
                articles: { 
                    $sum: { $cond: [{ $eq: ['$magzineType', 'article'] }, 1, 0] } 
                },
                digests: { 
                    $sum: { $cond: [{ $eq: ['$magzineType', 'digest'] }, 1, 0] } 
                }
            }},
            { $sort: { count: -1 } }
        ]);

        const formattedCategories = categories.map(cat => ({
            id: cat._id,
            name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
            icon: getCategoryIcon(cat._id),
            color: getCategoryColor(cat._id),
            description: getCategoryDescription(cat._id),
            count: cat.count,
            featured: ['technology', 'business', 'science'].includes(cat._id),
            breakdown: {
                magazines: cat.magazines,
                articles: cat.articles,
                digests: cat.digests
            }
        }));

        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: formattedCategories
        });

    } catch (error) {
        console.log('Categories fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching categories'
        });
    }
};

/**
 * Search content
 */
const searchContent = async (req, res) => {
    try {
        const { 
            q, 
            type = 'all', 
            category, 
            page = 1, 
            limit = 20 
        } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const startTime = Date.now();

        // Build search query
        let query = { 
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ]
        };

        if (type !== 'all') {
            const typeMap = {
                'magazines': 'magzine',
                'articles': 'article',
                'digests': 'digest'
            };
            query.magzineType = typeMap[type];
        }

        if (category) {
            query.category = category;
        }

        // Execute search with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const results = await Magzines.find(query)
            .select('-__v')
            .sort({ rating: -1, downloads: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const totalItems = await Magzines.countDocuments(query);
        const totalPages = Math.ceil(totalItems / parseInt(limit));
        const searchTime = Date.now() - startTime;

        const response = {
            success: true,
            message: 'Search results fetched successfully',
            data: {
                results,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                },
                searchStats: {
                    query: q,
                    totalResults: totalItems,
                    searchTime
                }
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.log('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while searching'
        });
    }
};

// Helper functions
function getCategoryIcon(category) {
    const iconMap = {
        'technology': '🔧',
        'business': '💼',
        'science': '🔬',
        'health': '🏥',
        'education': '📚',
        'entertainment': '🎬',
        'sports': '⚽',
        'politics': '🏛️',
        'lifestyle': '🌟',
        'other': '📄'
    };
    return iconMap[category] || '📄';
}

function getCategoryColor(category) {
    const colorMap = {
        'technology': '#3B82F6',
        'business': '#10B981',
        'science': '#8B5CF6',
        'health': '#EF4444',
        'education': '#F59E0B',
        'entertainment': '#EC4899',
        'sports': '#06B6D4',
        'politics': '#6366F1',
        'lifestyle': '#F97316',
        'other': '#6B7280'
    };
    return colorMap[category] || '#6B7280';
}

function getCategoryDescription(category) {
    const descMap = {
        'technology': 'Latest tech trends and innovations',
        'business': 'Business insights and strategies',
        'science': 'Scientific discoveries and research',
        'health': 'Health and wellness information',
        'education': 'Educational content and learning',
        'entertainment': 'Entertainment and media',
        'sports': 'Sports news and analysis',
        'politics': 'Political news and analysis',
        'lifestyle': 'Lifestyle and culture',
        'other': 'Miscellaneous content'
    };
    return descMap[category] || 'Various content types';
}

module.exports = {
    getHomeScreenData,
    getContentByType,
    getCategories,
    searchContent
}; 