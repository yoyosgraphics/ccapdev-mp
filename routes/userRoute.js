const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Registration Routes
router.get('/register', userController.getRegisterPageOne);
router.post('/register', userController.processRegisterPageOne);
router.post('/register/complete', userController.completeRegistration);

// Login Routes
router.get('/login', userController.getLoginPage);
router.post('/login', userController.loginUser);

// Profile Routes
router.get('/profile/:userId', userController.getUserProfile);
router.get('/profile/:userId/edit', userController.getEditProfilePage);
router.post('/profile/:userId/edit', userController.updateUserProfile);

// Logout Route
router.get('/logout', userController.logoutUser);

module.exports = router;
