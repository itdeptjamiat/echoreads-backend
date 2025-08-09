const Magzines = require('../models/magzinesSchema');
const Account = require('../models/accountCreate');

/**
 * Get magazine ratings and reviews
 * GET /api/v1/user/magazine-ratings/:mid
 * Query params: page, limit, sort (newest/oldest/rating)
 */
const getMagazineRatings = async (req, res) => {
  try {
    const { mid } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const userId = req.user?.uid || req.query.userId; // For getting user's own rating

    // Validation
    if (!mid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Magazine ID is required.' 
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

    // Get user's own rating if authenticated
    let userRating = null;
    if (userId) {
      const userReview = magazine.reviews.find(review => review.userId === parseInt(userId));
      if (userReview) {
        userRating = {
          rating: userReview.rating,
          review: userReview.review,
          time: userReview.time
        };
      }
    }

    // Prepare reviews for response
    let reviews = magazine.reviews.map(review => ({
      userId: review.userId,
      rating: review.rating,
      review: review.review,
      time: review.time
    }));

    // Sort reviews based on query parameter
    switch (sort) {
      case 'newest':
        reviews.sort((a, b) => new Date(b.time) - new Date(a.time));
        break;
      case 'oldest':
        reviews.sort((a, b) => new Date(a.time) - new Date(b.time));
        break;
      case 'rating':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      default:
        reviews.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    // Get user details for reviews (optional - can be removed for performance)
    const reviewsWithUserDetails = await Promise.all(
      paginatedReviews.map(async (review) => {
        try {
          const user = await Account.findOne({ uid: review.userId });
          return {
            ...review,
            username: user ? user.username : 'Anonymous',
            userProfilePic: user ? user.profilePic : null
          };
        } catch (error) {
          return {
            ...review,
            username: 'Anonymous',
            userProfilePic: null
          };
        }
      })
    );

    // Calculate rating statistics
    const totalReviews = magazine.reviews.length;
    const ratingStats = {
      1: magazine.reviews.filter(r => r.rating === 1).length,
      2: magazine.reviews.filter(r => r.rating === 2).length,
      3: magazine.reviews.filter(r => r.rating === 3).length,
      4: magazine.reviews.filter(r => r.rating === 4).length,
      5: magazine.reviews.filter(r => r.rating === 5).length
    };

    const response = {
      success: true,
      data: {
        magazineId: mid,
        magazineName: magazine.name,
        averageRating: magazine.rating,
        totalReviews: totalReviews,
        ratingStats: ratingStats,
        userRating: userRating,
        reviews: reviewsWithUserDetails,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalReviews / limitNum),
          hasNextPage: endIndex < totalReviews,
          hasPrevPage: pageNum > 1
        }
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Get Magazine Ratings Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again later.' 
    });
  }
};

module.exports = getMagazineRatings; 