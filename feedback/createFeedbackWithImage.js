const Feedback = require('../models/feedbackSchema');
const Account = require('../models/accountCreate');
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// R2 S3 API configuration
const s3 = new AWS.S3({
    endpoint: 'https://ef6de2d4389d2f6608f081f1c3405a28.r2.cloudflarestorage.com',
    accessKeyId: 'e680e4254dfba4e0bf0d481cd0c7c0bf',
    secretAccessKey: '51d24d04769e166ac11db7f81e56ba62207cf31b4b6634cce08027f22dc7d37e',
    region: 'auto',
    signatureVersion: 'v4',
});

// Multer configuration for image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
        }
    }
});

// Helper function to check if a value is empty
function isEmpty(val) {
    return !val || val.trim() === '';
}

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const createFeedbackWithImage = async (req, res) => {
    try {
        const { name, email, description, rating, category, userId } = req.body;

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

        // Rating validation (if provided)
        if (rating !== undefined && rating !== null) {
            if (isNaN(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be a number between 1 and 5'
                });
            }
        }

        // Category validation (if provided)
        const validCategories = ['bug_report', 'feature_request', 'general_feedback', 'complaint', 'suggestion', 'other'];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category. Valid categories are: ' + validCategories.join(', ')
            });
        }

        // If userId is provided, verify user exists
        if (userId) {
            const user = await Account.findOne({ uid: userId });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
        }

        // Handle image upload if provided
        let imageUrl = null;
        if (req.file) {
            try {
                // Validate file size
                if (req.file.size > 5 * 1024 * 1024) {
                    return res.status(400).json({
                        success: false,
                        message: 'Image size must be less than 5MB'
                    });
                }

                // Create unique filename for feedback image
                const fileExtension = path.extname(req.file.originalname);
                const fileName = `feedback-images/${Date.now()}-${uuidv4()}${fileExtension}`;

                // Upload to Cloudflare R2
                const params = {
                    Bucket: 'echoreads',
                    Key: fileName,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                    ContentDisposition: 'inline',
                };

                await s3.upload(params).promise();

                // Generate public R2 URL
                imageUrl = `https://pub-b8050509235e4bcca261901d10608e30.r2.dev/${fileName}`;

            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image. Please try again.'
                });
            }
        }

        // Create feedback object
        const feedbackData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            description: description.trim(),
            image: imageUrl,
            rating: rating || null,
            category: category || 'general_feedback',
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
                rating: newFeedback.rating,
                category: newFeedback.category,
                status: newFeedback.status,
                createdAt: newFeedback.createdAt
            }
        });

    } catch (error) {
        console.error('Create Feedback With Image Error:', error);

        // Handle multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Image size must be less than 5MB'
            });
        }

        if (error.message && error.message.includes('Only image files')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later.'
        });
    }
};

module.exports = { createFeedbackWithImage, upload }; 