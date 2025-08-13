const express = require('express');
const router = express.Router();
const signup = require('../accounts/signup');
const login = require('../accounts/login');
const requestPasswordReset = require('../accounts/requestPasswordReset');
const { verifyOtp, resendOtp } = require('../accounts/verifyOtp');
const setNewPasswordAfterOtp = require('../accounts/setNewPasswordAfterOtp');
const simplePasswordReset = require('../accounts/simplePasswordReset');
const { requestPasswordResetOtp, resetPasswordWithOtp } = require('../accounts/simplePasswordResetWithOtp');
const getAllUsers = require('../admin/getAlluser');
const verifyAdmin = require('../middleware/auth');
const getUserProfile = require('../userProfile/userProfile');
const updateUserProfile = require('../userProfile/updateUserProfile');
const adminResetPassword = require('../admin/adminResetPassword');
const createMagzine = require('../magzinesFiles/createMagzine');
const getAllMagzines = require('../magzinesFiles/getAllmagzin');
const getMagzineByMid = require('../magzinesFiles/getMagzineByMid');
const searchMagazinesByCategory = require('../magzinesFiles/searchMagazinesByCategory');
const deleteMagazin = require('../admin/deleteMagzin');
const updateMagazin = require('../admin/updateMagzin');

// Rating management imports
const rateMagazine = require('../ratings/rateMagazine');
const getMagazineRatings = require('../ratings/getMagazineRatings');
const deleteRating = require('../ratings/deleteRating');
const getTopRatedMagazines = require('../ratings/getTopRatedMagazines');
const { deleteReview, getRatingAnalytics, getAllReviews } = require('../ratings/adminRatingManagement');

// Plan management imports
const createPlan = require('../planPrices/createPlan');
const getAllPlans = require('../planPrices/getAllPlans');
const updatePlan = require('../admin/updatePlan');
const deletePlan = require('../admin/deletePlan');

// Admin user management
const deleteUser = require('../admin/deleteUser');
const { changeUserType, getUserTypeStats } = require('../admin/changeUserType');

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
router.post('/api/v1/user/set-new-password-after-otp', setNewPasswordAfterOtp);
// Simple password reset (no OTP, no tokens)
router.post('/api/v1/user/simple-password-reset', simplePasswordReset);

// Password reset with OTP verification (2 steps)
router.post('/api/v1/user/request-password-reset-otp', requestPasswordResetOtp);
router.post('/api/v1/user/reset-password-with-otp', resetPasswordWithOtp);

// user profile
router.get('/api/v1/user/profile/:uid', getUserProfile);
router.put('/api/v1/user/profile/:uid', updateUserProfile);

// get all magzines
router.get('/api/v1/user/magzines',getAllMagzines);
// get magazine by mid
router.get('/api/v1/user/magzines/:mid',getMagzineByMid);
// search magazines by category
router.post('/api/v1/user/search-magazines-by-category',searchMagazinesByCategory);

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
// change user type (admin only)
router.put('/api/v1/admin/change-user-type', verifyAdmin, changeUserType);
// get user type statistics (admin only)
router.get('/api/v1/admin/user-type-stats', verifyAdmin, getUserTypeStats);

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

// Rating management routes
router.post('/api/v1/user/rate-magazine', rateMagazine);
router.get('/api/v1/user/magazine-ratings/:mid', getMagazineRatings);
router.delete('/api/v1/user/delete-rating', deleteRating);
router.get('/api/v1/user/top-rated-magazines', getTopRatedMagazines);

// Admin rating management routes
router.delete('/api/v1/admin/delete-review', verifyAdmin, deleteReview);
router.get('/api/v1/admin/rating-analytics', verifyAdmin, getRatingAnalytics);
router.get('/api/v1/admin/all-reviews', verifyAdmin, getAllReviews);


module.exports = router;