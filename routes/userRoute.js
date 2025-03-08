const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Multi-step registration routes
router.get('/register', userController.getRegisterPageOne);
router.post('/register/step1', userController.processRegisterPageOne);
router.post('/register/complete', userController.completeRegistration);

// Login routes
router.get('/login', userController.getLoginPage);
router.post('/login', userController.loginUser);

// Logout route
router.get('/logout', userController.logoutUser);

// Profile routes
router.get('/profile/:userId', userController.getUserProfile);
router.get('/edit-profile/:userId', userController.getEditProfilePage);
router.post('/edit-profile/:userId', userController.updateUserProfile);

module.exports = router;
