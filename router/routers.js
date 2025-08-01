const express = require('express');
const router = express.Router();
const signup = require('../accounts/signup');
const login = require('../accounts/login');
const requestPasswordReset = require('../accounts/requestPasswordReset');
const { verifyOtp, resendOtp } = require('../accounts/verifyOtp');
const { resetPasswordWithToken, checkResetToken } = require('../accounts/resetPasswordWithToken');
const getAllUsers = require('../admin/getAlluser');
const verifyAdmin = require('../middleware/auth');
const getUserProfile = require('../userProfile/userProfile');
const adminResetPassword = require('../admin/adminResetPassword');
const createMagzine = require('../magzinesFiles/createMagzine');
const getAllMagzines = require('../magzinesFiles/getAllmagzin');
const getMagzineByMid = require('../magzinesFiles/getMagzineByMid');
const deleteMagazin = require('../admin/deleteMagzin');
const updateMagazin = require('../admin/updateMagzin');

// Plan management imports
const createPlan = require('../planPrices/createPlan');
const getAllPlans = require('../planPrices/getAllPlans');
const updatePlan = require('../admin/updatePlan');
const deletePlan = require('../admin/deletePlan');

// Admin user management
const deleteUser = require('../admin/deleteUser');

// Download management imports
const downloadMagazine = require('../downloads/downloadMagazine');
const getDownloadHistory = require('../downloads/getDownloadHistory');
const getDownloadStats = require('../downloads/getDownloadStats');

// Payment management imports
const getPaymentHistory = require('../payments/paymentHistory');
const getRevenueAnalytics = require('../payments/revenueAnalytics');
const createPayment = require('../payments/createPayment');
const getUserPayments = require('../payments/getUserPayments');
const refundPayment = require('../payments/refundPayment');
const handlePaymentWebhook = require('../payments/paymentWebhook');

// Auto plan management imports
const checkExpiredPlans = require('../autoPlanManagement/checkExpiredPlans');
const { getExpiryManagement, triggerAutoExpiryCheck, getExpiringSoonUsers } = require('../autoPlanManagement/expiryManagement');
const triggerAutoExpiry = require('../autoPlanManagement/autoExpiryRoute');
const { getSchedulerStatusRoute, triggerDailyCheckRoute, runDailyCheckRoute } = require('../autoPlanManagement/schedulerRoutes');

// account login
router.post('/api/v1/user/signup',signup);
router.post('/api/v1/user/login',login);

// Password reset flow
router.post('/api/v1/user/request-password-reset', requestPasswordReset);
router.post('/api/v1/user/verify-otp', verifyOtp);
router.post('/api/v1/user/resend-otp', resendOtp);
router.post('/api/v1/user/check-reset-token', checkResetToken);
router.post('/api/v1/user/reset-password', resetPasswordWithToken);

// user profile
router.get('/api/v1/user/profile/:uid', getUserProfile);

// get all magzines
router.get('/api/v1/user/magzines',getAllMagzines);
// get magazine by mid
router.get('/api/v1/user/magzines/:mid',getMagzineByMid);

// Plan management routes
router.get('/api/v1/plans', getAllPlans); // Public route to get all plans
router.post('/api/v1/admin/plan/create', verifyAdmin, createPlan);
router.put('/api/v1/admin/plan/update', verifyAdmin, updatePlan);
router.delete('/api/v1/admin/plan/delete', verifyAdmin, deletePlan);

// Get all users (admin only)
router.get('/api/v1/admin/users', verifyAdmin, getAllUsers);
// delete user (admin only)
router.delete('/api/v1/admin/delete-user', verifyAdmin, deleteUser);
// change password by admin
router.post('/api/v1/admin/reset-password',adminResetPassword);

// Download management routes
router.post('/api/v1/download/magazine', downloadMagazine);
router.get('/api/v1/download/history/:uid', getDownloadHistory);
router.post('/api/v1/admin/download-stats', verifyAdmin, getDownloadStats);

// Payment management routes
router.post('/api/v1/admin/payment-history', verifyAdmin, getPaymentHistory);
router.post('/api/v1/admin/revenue-analytics', verifyAdmin, getRevenueAnalytics);

// User payment routes
router.post('/api/v1/payment/create', createPayment);
router.get('/api/v1/payment/user/:userId', getUserPayments);

// Admin payment management routes
router.post('/api/v1/admin/payment/refund', verifyAdmin, refundPayment);

// Payment webhook routes (no auth required for webhooks)
router.post('/api/v1/payment/webhook/:provider', handlePaymentWebhook);

// Auto plan management routes (no admin auth required for automatic process)
router.post('/api/v1/auto/check-expired-plans', triggerAutoExpiry);

// Daily scheduler routes (no auth required for automated processes)
router.get('/api/v1/scheduler/status', getSchedulerStatusRoute);
router.post('/api/v1/scheduler/trigger-daily', triggerDailyCheckRoute);
router.post('/api/v1/scheduler/run-daily', runDailyCheckRoute);

// Admin auto plan management routes
router.post('/api/v1/admin/check-expired-plans', verifyAdmin, checkExpiredPlans);
router.post('/api/v1/admin/expiry-management', verifyAdmin, getExpiryManagement);
router.post('/api/v1/admin/trigger-auto-expiry', verifyAdmin, triggerAutoExpiryCheck);
router.post('/api/v1/admin/expiring-soon', verifyAdmin, getExpiringSoonUsers);
// create a magzine
router.post('/api/v1/admin/create-magzine',createMagzine);
router.delete('/api/v1/admin/delete-magzine',deleteMagazin);
router.put('/api/v1/admin/update-magzine',updateMagazin);


module.exports = router;