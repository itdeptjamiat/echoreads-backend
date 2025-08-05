const Payment = require('../models/paymentSchema');
const Account = require('../models/accountCreate');
const PlanPrice = require('../models/planPriceSchema');

const createPayment = async (req, res) => {
    try {
        const {
            userId,
            planId,
            paymentMethod,
            provider,
            amount,
            currency = 'USD',
            billingDetails,
            ipAddress,
            userAgent,
            discountCode,
            isSubscription = false
        } = req.body;

        // Validate required fields
        if (!userId || !planId || !paymentMethod || !provider || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, planId, paymentMethod, provider, amount'
            });
        }

        // Validate user exists
        const user = await Account.findOne({ uid: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate plan exists
        const plan = await PlanPrice.findById(planId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found or inactive'
            });
        }

        // Calculate payment details
        let finalAmount = amount;
        let discountApplied = 0;
        let originalAmount = amount;

        // Apply discount if provided
        if (discountCode) {
            // You can implement discount logic here
            // For now, we'll use a simple 10% discount example
            discountApplied = amount * 0.1;
            finalAmount = amount - discountApplied;
        }

        // Calculate tax (example: 5% tax)
        const taxAmount = finalAmount * 0.05;
        const processingFee = 0; // Set based on your payment provider

        // Generate unique 8-digit payment ID
        const paymentId = Math.floor(10000000 + Math.random() * 90000000);
        
        // Generate provider transaction ID
        const providerTransactionId = `${provider.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create payment record
        const payment = new Payment({
            userId,
            planId,
            paymentId,
            provider,
            providerTransactionId,
            amount: finalAmount,
            currency,
            status: 'pending',
            paymentMethod,
            planType: plan.planType,
            planDuration: plan.duration,
            isSubscription,
            discountApplied,
            originalAmount,
            taxAmount,
            processingFee,
            billingDetails,
            ipAddress,
            userAgent,
            metadata: {
                discountCode: discountCode || null,
                userEmail: user.email,
                planName: plan.planType
            }
        });

        await payment.save();

        // Process payment based on provider
        const paymentResult = await processPaymentByProvider(payment, provider, paymentMethod);

        if (paymentResult.success) {
            // Update payment status to completed
            payment.status = 'completed';
            payment.completedAt = new Date();
            await payment.save();

            // Update user's plan if payment is successful
            await updateUserPlan(userId, plan.planType, plan.duration);

            res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                payment: {
                    paymentId: payment.paymentId,
                    amount: payment.amount,
                    status: payment.status,
                    planType: payment.planType,
                    planDuration: payment.planDuration
                }
            });
        } else {
            // Update payment status to failed
            payment.status = 'failed';
            payment.errorDetails = {
                code: paymentResult.errorCode || 'PAYMENT_FAILED',
                message: paymentResult.errorMessage || 'Payment processing failed',
                details: paymentResult.errorDetails || ''
            };
            await payment.save();

            res.status(400).json({
                success: false,
                message: 'Payment processing failed',
                error: paymentResult.errorMessage
            });
        }

    } catch (error) {
        console.error('Create Payment Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Process payment based on provider
const processPaymentByProvider = async (payment, provider, paymentMethod) => {
    try {
        switch (provider.toLowerCase()) {
            case 'stripe':
                return await processStripePayment(payment, paymentMethod);
            case 'paypal':
                return await processPayPalPayment(payment, paymentMethod);
            case 'razorpay':
                return await processRazorpayPayment(payment, paymentMethod);
            case 'manual':
                return await processManualPayment(payment, paymentMethod);
            default:
                return {
                    success: false,
                    errorMessage: 'Unsupported payment provider'
                };
        }
    } catch (error) {
        return {
            success: false,
            errorMessage: error.message
        };
    }
};

// Stripe payment processing
const processStripePayment = async (payment, paymentMethod) => {
    // Implement Stripe payment logic here
    // This is a mock implementation
    return {
        success: true,
        transactionId: `stripe_${Date.now()}`
    };
};

// PayPal payment processing
const processPayPalPayment = async (payment, paymentMethod) => {
    // Implement PayPal payment logic here
    // This is a mock implementation
    return {
        success: true,
        transactionId: `paypal_${Date.now()}`
    };
};

// Razorpay payment processing
const processRazorpayPayment = async (payment, paymentMethod) => {
    // Implement Razorpay payment logic here
    // This is a mock implementation
    return {
        success: true,
        transactionId: `razorpay_${Date.now()}`
    };
};

// Manual payment processing
const processManualPayment = async (payment, paymentMethod) => {
    // For manual payments (cash, bank transfer, etc.)
    return {
        success: true,
        transactionId: `manual_${Date.now()}`
    };
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

module.exports = createPayment; 