const Account = require('../models/accountCreate');
const Magzines = require('../models/magzinesSchema');

/**
 * Rate a magazine
 * POST /api/v1/user/rate-magazine
 * Body: { mid: number, rating: number (1-5), review: string (optional) }
 */
const rateMagazine = async (req, res) => {
  try {
    const { mid, rating, review } = req.body;
    const userId = req.user?.uid || req.body.userId; // Get from auth middleware or body

    // Validation
    if (!mid || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Magazine ID and rating are required.' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required.' 
      });
    }

    // Validate rating range (1-5)
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be a whole number between 1 and 5.' 
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

    // Check if user has already rated this magazine
    const existingReview = magazine.reviews.find(review => review.userId === userId);
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.review = review || existingReview.review;
      existingReview.time = new Date();
    } else {
      // Add new review
      magazine.reviews.push({
        userId: userId,
        rating: rating,
        review: review || '',
        time: new Date()
      });
    }

    // Calculate new average rating
    const totalRating = magazine.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / magazine.reviews.length;
    
    // Update magazine rating
    magazine.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
    
    await magazine.save();

    return res.status(200).json({
      success: true,
      message: existingReview ? 'Rating updated successfully.' : 'Rating added successfully.',
      data: {
        magazineId: mid,
        userRating: rating,
        averageRating: magazine.rating,
        totalReviews: magazine.reviews.length,
        userReview: review || ''
      }
    });

  } catch (error) {
    console.error('Rate Magazine Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again later.' 
    });
  }
};

module.exports = rateMagazine; 