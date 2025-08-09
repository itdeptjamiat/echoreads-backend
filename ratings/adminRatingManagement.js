const Magzines = require('../models/magzinesSchema');
const Account = require('../models/accountCreate');

/**
 * Admin: Delete a specific review
 * DELETE /api/v1/admin/delete-review
 * Body: { mid: number, userId: number }
 */
const deleteReview = async (req, res) => {
  try {
    const { mid, userId } = req.body;

    // Validation
    if (!mid || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Magazine ID and User ID are required.' 
      });
    }

    // Check if magazine exists
    const magazine = await Magzines.findOne({ mid: mid });
    if (!magazine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Magazine not found.' 
      });
    }

    // Find and remove the specific review
    const reviewIndex = magazine.reviews.findIndex(review => review.userId === userId);
    
    if (reviewIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found.' 
      });
    }

    // Remove the review
    magazine.reviews.splice(reviewIndex, 1);

    // Recalculate average rating
    if (magazine.reviews.length > 0) {
      const totalRating = magazine.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / magazine.reviews.length;
      magazine.rating = Math.round(averageRating * 10) / 10;
    } else {
      magazine.rating = 0;
    }
    
    await magazine.save();

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
      data: {
        magazineId: mid,
        userId: userId,
        averageRating: magazine.rating,
        totalReviews: magazine.reviews.length
      }
    });

  } catch (error) {
    console.error('Admin Delete Review Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again later.' 
    });
  }
};

/**
 * Admin: Get rating analytics
 * GET /api/v1/admin/rating-analytics
 * Query params: startDate, endDate, category
 */
const getRatingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Build category filter
    if (category) {
      dateFilter.category = category;
    }

    // Get magazines with reviews
    const magazines = await Magzines.find({
      ...dateFilter,
      'reviews.0': { $exists: true } // Only magazines with reviews
    }).select('mid name category rating reviews createdAt');

    // Calculate analytics
    const analytics = {
      totalMagazines: magazines.length,
      totalReviews: magazines.reduce((sum, mag) => sum + mag.reviews.length, 0),
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categoryStats: {},
      recentActivity: []
    };

    // Calculate rating distribution and category stats
    magazines.forEach(magazine => {
      // Rating distribution
      magazine.reviews.forEach(review => {
        analytics.ratingDistribution[review.rating]++;
      });

      // Category stats
      if (!analytics.categoryStats[magazine.category]) {
        analytics.categoryStats[magazine.category] = {
          count: 0,
          averageRating: 0,
          totalReviews: 0
        };
      }
      analytics.categoryStats[magazine.category].count++;
      analytics.categoryStats[magazine.category].totalReviews += magazine.reviews.length;
      analytics.categoryStats[magazine.category].averageRating += magazine.rating;
    });

    // Calculate average rating
    const totalRating = magazines.reduce((sum, mag) => sum + mag.rating, 0);
    analytics.averageRating = magazines.length > 0 ? 
      Math.round((totalRating / magazines.length) * 10) / 10 : 0;

    // Calculate category averages
    Object.keys(analytics.categoryStats).forEach(category => {
      const stats = analytics.categoryStats[category];
      stats.averageRating = stats.count > 0 ? 
        Math.round((stats.averageRating / stats.count) * 10) / 10 : 0;
    });

    // Get recent reviews (last 10)
    const recentReviews = [];
    magazines.forEach(magazine => {
      magazine.reviews.forEach(review => {
        recentReviews.push({
          magazineId: magazine.mid,
          magazineName: magazine.name,
          userId: review.userId,
          rating: review.rating,
          review: review.review,
          time: review.time
        });
      });
    });

    // Sort by time and take last 10
    analytics.recentActivity = recentReviews
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get Rating Analytics Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again later.' 
    });
  }
};

/**
 * Admin: Get all reviews for moderation
 * GET /api/v1/admin/all-reviews
 * Query params: page, limit, rating, magazineId
 */
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, magazineId } = req.query;

    // Build filter query
    const filterQuery = { 'reviews.0': { $exists: true } };
    if (magazineId) {
      filterQuery.mid = parseInt(magazineId);
    }

    // Get magazines with reviews
    const magazines = await Magzines.find(filterQuery)
      .select('mid name category rating reviews');

    // Flatten all reviews
    let allReviews = [];
    magazines.forEach(magazine => {
      magazine.reviews.forEach(review => {
        allReviews.push({
          magazineId: magazine.mid,
          magazineName: magazine.name,
          category: magazine.category,
          userId: review.userId,
          rating: review.rating,
          review: review.review,
          time: review.time
        });
      });
    });

    // Filter by rating if provided
    if (rating) {
      allReviews = allReviews.filter(review => review.rating === parseInt(rating));
    }

    // Sort by time (newest first)
    allReviews.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedReviews = allReviews.slice(startIndex, endIndex);

    // Get user details for reviews
    const reviewsWithUserDetails = await Promise.all(
      paginatedReviews.map(async (review) => {
        try {
          const user = await Account.findOne({ uid: review.userId });
          return {
            ...review,
            username: user ? user.username : 'Unknown User',
            userEmail: user ? user.email : 'Unknown Email',
            userType: user ? user.userType : 'Unknown'
          };
        } catch (error) {
          return {
            ...review,
            username: 'Unknown User',
            userEmail: 'Unknown Email',
            userType: 'Unknown'
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        reviews: reviewsWithUserDetails,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(allReviews.length / limitNum),
          totalReviews: allReviews.length,
          hasNextPage: endIndex < allReviews.length,
          hasPrevPage: pageNum > 1
        },
        filters: {
          rating: rating || 'all',
          magazineId: magazineId || 'all'
        }
      }
    });

  } catch (error) {
    console.error('Get All Reviews Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again later.' 
    });
  }
};

module.exports = {
  deleteReview,
  getRatingAnalytics,
  getAllReviews
}; 