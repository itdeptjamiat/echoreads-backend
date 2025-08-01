const Payment = require('../models/paymentSchema');
const Account = require('../models/accountCreate');

const refundPayment = async (req, res) => {
    try {
        const { paymentId, refundAmount, refundReason, adminUid } = req.body;

        // Validate required fields
        if (!paymentId || !refundAmount || !refundReason || !adminUid) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: paymentId, refundAmount, refundReason, adminUid'
            });
        }

        // Verify admin authorization
        const admin = await Account.findOne({ uid: adminUid });
        if (!admin || admin.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin authorization required'
            });
        }

        // Find the payment
        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if payment can be refunded
        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Only completed payments can be refunded'
            });
        }

        if (payment.refundAmount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Payment has already been refunded'
            });
        }

        // Validate refund amount
        if (refundAmount > payment.amount) {
            return res.status(400).json({
                success: false,
                message: 'Refund amount cannot exceed original payment amount'
            });
        }

        // Process refund based on provider
        const refundResult = await processRefundByProvider(payment, refundAmount);

        if (refundResult.success) {
            // Update payment with refund information
            payment.refundAmount = refundAmount;
            payment.refundReason = refundReason;
            payment.refundedAt = new Date();
            payment.status = refundAmount === payment.amount ? 'refunded' : 'completed';
            
            await payment.save();

            // If full refund, update user's plan
            if (refundAmount === payment.amount) {
                await handleFullRefund(payment.userId);
            }

            res.status(200).json({
                success: true,
                message: 'Refund processed successfully',
                refund: {
                    paymentId: payment.paymentId,
                    refundAmount,
                    refundReason,
                    refundedAt: payment.refundedAt,
                    status: payment.status
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Refund processing failed',
                error: refundResult.errorMessage
            });
        }

    } catch (error) {
        console.error('Refund Payment Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Process refund based on provider
const processRefundByProvider = async (payment, refundAmount) => {
    try {
        switch (payment.provider.toLowerCase()) {
            case 'stripe':
                return await processStripeRefund(payment, refundAmount);
            case 'paypal':
                return await processPayPalRefund(payment, refundAmount);
            case 'razorpay':
                return await processRazorpayRefund(payment, refundAmount);
            case 'manual':
                return await processManualRefund(payment, refundAmount);
            default:
                return {
                    success: false,
                    errorMessage: 'Unsupported payment provider for refund'
                };
        }
    } catch (error) {
        return {
            success: false,
            errorMessage: error.message
        };
    }
};

// Stripe refund processing
const processStripeRefund = async (payment, refundAmount) => {
    // Implement Stripe refund logic here
    // This is a mock implementation
    return {
        success: true,
        refundId: `stripe_refund_${Date.now()}`
    };
};

// PayPal refund processing
const processPayPalRefund = async (payment, refundAmount) => {
    // Implement PayPal refund logic here
    // This is a mock implementation
    return {
        success: true,
        refundId: `paypal_refund_${Date.now()}`
    };
};

// Razorpay refund processing
const processRazorpayRefund = async (payment, refundAmount) => {
    // Implement Razorpay refund logic here
    // This is a mock implementation
    return {
        success: true,
        refundId: `razorpay_refund_${Date.now()}`
    };
};

// Manual refund processing
const processManualRefund = async (payment, refundAmount) => {
    // For manual refunds (bank transfer, etc.)
    return {
        success: true,
        refundId: `manual_refund_${Date.now()}`
    };
};

// Handle full refund by updating user's plan
const handleFullRefund = async (userId) => {
    try {
        const user = await Account.findOne({ uid: userId });
        if (!user) return;

        // Reset user to free plan
        await Account.updateOne(
            { uid: userId },
            {
                plan: 'free',
                planStart: null,
                planExpiry: null
            }
        );
    } catch (error) {
        console.error('Handle Full Refund Error:', error.message);
    }
};

module.exports = refundPayment; 