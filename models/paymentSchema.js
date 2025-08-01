const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    // User reference
    userId: {
        type: Number, // Using uid from Account model
        required: true
    },
    
    // Plan reference
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlanPrice',
        required: true
    },
    
    // Payment details
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    
    // External payment provider details
    provider: {
        type: String,
        enum: ['stripe', 'paypal', 'razorpay', 'manual'],
        required: true
    },
    
    providerTransactionId: {
        type: String,
        required: true
    },
    
    // Payment amount and currency
    amount: {
        type: Number,
        required: true
    },
    
    currency: {
        type: String,
        default: 'USD'
    },
    
    // Payment status
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    
    // Payment method
    paymentMethod: {
        type: String,
        enum: ['card', 'bank_transfer', 'wallet', 'upi', 'cash'],
        required: true
    },
    
    // Plan details at time of purchase
    planType: {
        type: String,
        enum: ['free', 'echopro', 'echoproplus'],
    },
    
    planDuration: {
        type: Number, // in months
        required: true
    },
    
    // Subscription details
    isSubscription: {
        type: Boolean,
        default: false
    },
    
    subscriptionId: {
        type: String
    },
    
    nextBillingDate: {
        type: Date
    },
    
    // Discount applied
    discountApplied: {
        type: Number,
        default: 0
    },
    
    originalAmount: {
        type: Number,
        required: true
    },
    
    // Tax and fees
    taxAmount: {
        type: Number,
        default: 0
    },
    
    processingFee: {
        type: Number,
        default: 0
    },
    
    // Billing information
    billingDetails: {
        name: String,
        email: String,
        address: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            postalCode: String,
            country: String
        }
    },
    
    // Payment metadata
    metadata: {
        type: Map,
        of: String
    },
    
    // Error details for failed payments
    errorDetails: {
        code: String,
        message: String,
        details: String
    },
    
    // Refund information
    refundAmount: {
        type: Number,
        default: 0
    },
    
    refundReason: {
        type: String
    },
    
    refundedAt: {
        type: Date
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
    completedAt: {
        type: Date
    },
    
    // IP address and user agent for security
    ipAddress: {
        type: String
    },
    
    userAgent: {
        type: String
    }
});

// Update the updatedAt field before saving
paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for better query performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ providerTransactionId: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for total amount including tax and fees
paymentSchema.virtual('totalAmount').get(function() {
    return this.amount + this.taxAmount + this.processingFee;
});

// Virtual for net amount after discount
paymentSchema.virtual('netAmount').get(function() {
    return this.amount - this.discountApplied;
});

// Method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
    return this.status === 'completed';
};

// Method to check if payment is refundable
paymentSchema.methods.isRefundable = function() {
    return this.status === 'completed' && this.refundAmount === 0;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);
};

// Static method to get revenue by date range
paymentSchema.statics.getRevenueByDateRange = function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                status: 'completed',
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                revenue: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
    ]);
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 