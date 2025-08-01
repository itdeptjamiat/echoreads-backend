const Payment = require('../models/paymentSchema');
const Account = require('../models/accountCreate');

const handlePaymentWebhook = async (req, res) => {
    try {
        const { provider } = req.params;
        const webhookData = req.body;
        const signature = req.headers['x-signature'] || req.headers['stripe-signature'];

        // Verify webhook signature based on provider
        const isValidSignature = await verifyWebhookSignature(provider, webhookData, signature);
        
        if (!isValidSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        // Process webhook based on provider
        const result = await processWebhookByProvider(provider, webhookData);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Webhook processing failed',
                error: result.error
            });
        }

    } catch (error) {
        console.error('Payment Webhook Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Verify webhook signature
const verifyWebhookSignature = async (provider, webhookData, signature) => {
    try {
        switch (provider.toLowerCase()) {
            case 'stripe':
                return await verifyStripeSignature(webhookData, signature);
            case 'paypal':
                return await verifyPayPalSignature(webhookData, signature);
            case 'razorpay':
                return await verifyRazorpaySignature(webhookData, signature);
            default:
                return true; // For manual payments or testing
        }
    } catch (error) {
        console.error('Signature verification failed:', error.message);
        return false;
    }
};

// Verify Stripe webhook signature
const verifyStripeSignature = async (webhookData, signature) => {
    // Implement Stripe signature verification
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(webhookData, signature, process.env.STRIPE_WEBHOOK_SECRET);
    // return true;
    return true; // Mock implementation
};

// Verify PayPal webhook signature
const verifyPayPalSignature = async (webhookData, signature) => {
    // Implement PayPal signature verification
    return true; // Mock implementation
};

// Verify Razorpay webhook signature
const verifyRazorpaySignature = async (webhookData, signature) => {
    // Implement Razorpay signature verification
    return true; // Mock implementation
};

// Process webhook based on provider
const processWebhookByProvider = async (provider, webhookData) => {
    try {
        switch (provider.toLowerCase()) {
            case 'stripe':
                return await processStripeWebhook(webhookData);
            case 'paypal':
                return await processPayPalWebhook(webhookData);
            case 'razorpay':
                return await processRazorpayWebhook(webhookData);
            default:
                return {
                    success: false,
                    error: 'Unsupported payment provider'
                };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Process Stripe webhook
const processStripeWebhook = async (webhookData) => {
    try {
        const event = webhookData;
        
        switch (event.type) {
            case 'payment_intent.succeeded':
                return await handlePaymentSuccess(event.data.object);
            case 'payment_intent.payment_failed':
                return await handlePaymentFailure(event.data.object);
            case 'charge.refunded':
                return await handlePaymentRefund(event.data.object);
            default:
                return { success: true, message: 'Event type not handled' };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Process PayPal webhook
const processPayPalWebhook = async (webhookData) => {
    try {
        const event = webhookData;
        
        switch (event.event_type) {
            case 'PAYMENT.CAPTURE.COMPLETED':
                return await handlePaymentSuccess(event.resource);
            case 'PAYMENT.CAPTURE.DENIED':
                return await handlePaymentFailure(event.resource);
            case 'PAYMENT.CAPTURE.REFUNDED':
                return await handlePaymentRefund(event.resource);
            default:
                return { success: true, message: 'Event type not handled' };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Process Razorpay webhook
const processRazorpayWebhook = async (webhookData) => {
    try {
        const event = webhookData;
        
        switch (event.event) {
            case 'payment.captured':
                return await handlePaymentSuccess(event.payload.payment.entity);
            case 'payment.failed':
                return await handlePaymentFailure(event.payload.payment.entity);
            case 'refund.processed':
                return await handlePaymentRefund(event.payload.refund.entity);
            default:
                return { success: true, message: 'Event type not handled' };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Handle successful payment
const handlePaymentSuccess = async (paymentData) => {
    try {
        // Find payment by provider transaction ID
        const payment = await Payment.findOne({
            providerTransactionId: paymentData.id || paymentData.payment_id
        });

        if (!payment) {
            return {
                success: false,
                error: 'Payment not found'
            };
        }

        // Update payment status
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        // Update user's plan
        await updateUserPlan(payment.userId, payment.planType, payment.planDuration);

        return {
            success: true,
            message: 'Payment completed successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Handle failed payment
const handlePaymentFailure = async (paymentData) => {
    try {
        // Find payment by provider transaction ID
        const payment = await Payment.findOne({
            providerTransactionId: paymentData.id || paymentData.payment_id
        });

        if (!payment) {
            return {
                success: false,
                error: 'Payment not found'
            };
        }

        // Update payment status
        payment.status = 'failed';
        payment.errorDetails = {
            code: paymentData.last_payment_error?.code || 'PAYMENT_FAILED',
            message: paymentData.last_payment_error?.message || 'Payment failed',
            details: JSON.stringify(paymentData)
        };
        await payment.save();

        return {
            success: true,
            message: 'Payment marked as failed'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Handle payment refund
const handlePaymentRefund = async (refundData) => {
    try {
        // Find payment by provider transaction ID
        const payment = await Payment.findOne({
            providerTransactionId: refundData.payment_intent || refundData.payment_id
        });

        if (!payment) {
            return {
                success: false,
                error: 'Payment not found'
            };
        }

        // Update payment with refund information
        payment.refundAmount = refundData.amount || payment.amount;
        payment.refundReason = 'Webhook refund';
        payment.refundedAt = new Date();
        payment.status = 'refunded';
        await payment.save();

        // Handle full refund
        if (payment.refundAmount === payment.amount) {
            await handleFullRefund(payment.userId);
        }

        return {
            success: true,
            message: 'Refund processed successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Update user's plan after successful payment
const updateUserPlan = async (userId, planType, duration) => {
    try {
        const user = await Account.findOne({ uid: userId });
        if (!user) return;

        const currentDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + duration);

        await Account.updateOne(
            { uid: userId },
            {
                plan: planType,
                planStart: currentDate,
                planExpiry: expiryDate
            }
        );
    } catch (error) {
        console.error('Update User Plan Error:', error.message);
    }
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

module.exports = handlePaymentWebhook; 