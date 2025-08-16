const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null // Optional image URL
    },
    userId: {
        type: Number, // Using uid from Account model for logged-in users
        default: null // Optional for guest feedback
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'rejected'],
        default: 'pending'
    },

    isPublic: {
        type: Boolean,
        default: false // Whether to show this feedback publicly
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

});

// Update the updatedAt field before saving
feedbackSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for better query performance
feedbackSchema.index({ email: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;