const express = require('express');
const router = express.Router();
const signup = require('../accounts/signup');
const login = require('../accounts/login');
const getAllUsers = require('../admin/getAlluser');
const verifyAdmin = require('../middleware/auth');
const getUserProfile = require('../userProfile/userProfile');
const adminResetPassword = require('../admin/adminResetPassword');
// account login
router.post('/api/v1/user/signup',signup);
router.post('/api/v1/user/login',login);

// user profile
router.get('/api/v1/user/profile/:uid', getUserProfile);














// Get all users (admin only)
router.get('/api/v1/admin/users', verifyAdmin, getAllUsers);
// change password by admin
router.post('/api/v1/admin/reset-password',adminResetPassword);


module.exports = router;