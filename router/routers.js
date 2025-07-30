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

// account login
router.post('/api/v1/user/signup',signup);
router.post('/api/v1/user/login',login);

// user profile
router.get('/api/v1/user/profile/:uid', getUserProfile);

// get all magzines
router.get('/api/v1/user/magzines',getAllMagzines);














// Get all users (admin only)
router.get('/api/v1/admin/users', verifyAdmin, getAllUsers);
// change password by admin
router.post('/api/v1/admin/reset-password',adminResetPassword);
// create a magzine
router.post('/api/v1/admin/create-magzine',createMagzine);
router.delete('/api/v1/admin/delete-magzine',deleteMagazin);
router.put('/api/v1/admin/update-magzine',updateMagazin);


module.exports = router;