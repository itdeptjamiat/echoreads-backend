const Feedback = require('../models/feedbackSchema');
const Account = require('../models/accountCreate');

// Helper function to check if a value is empty
function isEmpty(val) {
    return !val || val.trim() === '';
}

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const createFeedback = async (req, res) => {
    try {
        const { name, email, description, image, userId } = req.body;

        // Required field validation
        if (isEmpty(name)) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (isEmpty(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        if (isEmpty(description)) {
            return res.status(400).json({
                success: false,
                message: 'Description is required'
            });
        }

        // Email format validation
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Name length validation
        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters long'
            });
        }

        // Description length validation
        if (description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Description must be at least 10 characters long'
            });
        }

        // If userId is provided, verify user exists (optional validation)
        if (userId) {
            const user = await Account.findOne({ uid: userId });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
        }

        // Create feedback object
        const feedbackData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            description: description.trim(),
            image: image || null,
            userId: userId || null
        };

        // Create and save feedback
        const newFeedback = new Feedback(feedbackData);
        await newFeedback.save();

        // Success response
        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: {
                feedbackId: newFeedback._id,
                name: newFeedback.name,
                email: newFeedback.email,
                description: newFeedback.description,
                image: newFeedback.image,
                userId: newFeedback.userId,
                status: newFeedback.status,
                isPublic: newFeedback.isPublic,
                createdAt: newFeedback.createdAt
            }
        });

    } catch (error) {
        console.error('Create Feedback Error:', error);

        // Handle duplicate email error (if you want to prevent multiple feedback from same email)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Feedback from this email already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later.'
        });
    }
};

module.exports = createFeedback; 