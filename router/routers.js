const express = require('express');
const router = express.Router();
const signup = require('../accounts/signup');
const login = require('../accounts/login');
const getAllUsers = require('../admin/getAlluser');
const verifyAdmin = require('../middleware/auth');
const getUserProfile = require('../userProfile/userProfile');
const adminResetPassword = require('../admin/adminResetPassword');
const createMagzine = require('../magzinesFiles/createMagzine');
const getAllMagzines = require('../magzinesFiles/getAllmagzin');
const deleteMagazin = require('../admin/deleteMagzin');
const updateMagazin = require('../admin/updateMagzin');

// Plan management imports
const createPlan = require('../planPrices/createPlan');
const getAllPlans = require('../planPrices/getAllPlans');
const updatePlan = require('../admin/updatePlan');
const deletePlan = require('../admin/deletePlan');

// account login
router.post('/api/v1/user/signup',signup);
router.post('/api/v1/user/login',login);

// user profile
router.get('/api/v1/user/profile/:uid', getUserProfile);

// get all magzines
router.get('/api/v1/user/magzines',getAllMagzines);














// Plan management routes
router.get('/api/v1/plans', getAllPlans); // Public route to get all plans
router.post('/api/v1/admin/plan/create', verifyAdmin, createPlan);
router.put('/api/v1/admin/plan/update', verifyAdmin, updatePlan);
router.delete('/api/v1/admin/plan/delete', verifyAdmin, deletePlan);

// Get all users (admin only)
router.get('/api/v1/admin/users', verifyAdmin, getAllUsers);
// change password by admin
router.post('/api/v1/admin/reset-password',adminResetPassword);
// create a magzine
router.post('/api/v1/admin/create-magzine',createMagzine);
router.delete('/api/v1/admin/delete-magzine',deleteMagazin);
router.put('/api/v1/admin/update-magzine',updateMagazin);


module.exports = router;