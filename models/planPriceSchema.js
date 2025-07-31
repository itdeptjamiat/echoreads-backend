const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planPriceSchema = new Schema({
    planType: {
        type: String,
        required: true,
        enum: ['free', 'echopro', 'echoproplus'],
        
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    duration: {
        type: Number, // in months
        required: true,
        default: 1
    },
    features: [{
        type: String
    }],
    maxDownloads: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    maxMagazines: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    discountValidUntil: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
planPriceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const PlanPrice = mongoose.model('PlanPrice', planPriceSchema);

module.exports = PlanPrice; 