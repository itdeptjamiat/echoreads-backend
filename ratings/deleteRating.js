const Account = require('../models/accountCreate');
const Magzines = require('../models/magzinesSchema');

/**
 * Delete user's rating for a magazine
 * DELETE /api/v1/user/delete-rating
 * Body: { mid: number }
 */
const deleteRating = async (req, res) => {
  try {
    const { mid } = req.body;
    const userId = req.user?.uid || req.body.userId; // Get from auth middleware or body

    // Validation
    if (!mid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Magazine ID is required.' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required.' 
      });
    }

    // Check if user exists
    const user = await Account.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
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

    // Find user's review
    const userReviewIndex = magazine.reviews.findIndex(review => review.userId === userId);
    
    if (userReviewIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'No rating found for this magazine.' 
      });
    }

    // Remove the review
    magazine.reviews.splice(userReviewIndex, 1);

    // Recalculate average rating
    if (magazine.reviews.length > 0) {
      const totalRating = magazine.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / magazine.reviews.length;
      magazine.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
    } else {
      magazine.rating = 0; // No reviews left
    }
    
    await magazine.save();

    return res.status(200).json({
      success: true,
      message: 'Rating deleted successfully.',
      data: {
        magazineId: mid,
        averageRating: magazine.rating,
        totalReviews: magazine.reviews.length
      }
    });

  } catch (error) {
    console.error('Delete Rating Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again later.' 
    });
  }
};

module.exports = deleteRating; 