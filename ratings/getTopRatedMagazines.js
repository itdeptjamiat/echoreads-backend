const Magzines = require('../models/magzinesSchema');

/**
 * Get top-rated magazines
 * GET /api/v1/user/top-rated-magazines
 * Query params: page, limit, minRating, category, type, sort
 */
const getTopRatedMagazines = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      minRating = 0, 
      category, 
      type, 
      sort = 'rating' 
    } = req.query;

    // Build filter query
    const filterQuery = {
      isActive: true,
      rating: { $gte: parseFloat(minRating) }
    };

    // Add category filter if provided
    if (category) {
      filterQuery.category = category;
    }

    // Add type filter if provided
    if (type) {
      filterQuery.type = type;
    }

    // Build sort query
    let sortQuery = {};
    switch (sort) {
      case 'rating':
        sortQuery = { rating: -1, downloads: -1 };
        break;
      case 'downloads':
        sortQuery = { downloads: -1, rating: -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      default:
        sortQuery = { rating: -1, downloads: -1 };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalMagazines = await Magzines.countDocuments(filterQuery);

    // Get magazines with pagination
    const magazines = await Magzines.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .select('mid name image type category rating downloads description createdAt');

    // Format response data
    const formattedMagazines = magazines.map(magazine => ({
      mid: magazine.mid,
      name: magazine.name,
      image: magazine.image,
      type: magazine.type,
      category: magazine.category,
      rating: magazine.rating,
      downloads: magazine.downloads,
      description: magazine.description,
      createdAt: magazine.createdAt
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalMagazines / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Get rating statistics for all magazines
    const ratingStats = await Magzines.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalMagazines: { $sum: 1 },
          magazinesWithRatings: {
            $sum: { $cond: [{ $gt: ['$rating', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const response = {
      success: true,
      data: {
        magazines: formattedMagazines,
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalMagazines: totalMagazines,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage
        },
        filters: {
          minRating: parseFloat(minRating),
          category: category || 'all',
          type: type || 'all',
          sort: sort
        },
        statistics: ratingStats[0] || {
          averageRating: 0,
          totalMagazines: 0,
          magazinesWithRatings: 0
        }
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Get Top Rated Magazines Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again later.' 
    });
  }
};

module.exports = getTopRatedMagazines; 