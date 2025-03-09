const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/users/login?alert=error&message=' + encodeURIComponent('Please log in to access this page'));
  }
};

// Registration routes
router.get('/register', userController.showRegisterForm);
router.post('/register-step-one', userController.registerStepOne);
router.post('/register', userController.register);

// Login routes
router.get('/login', userController.showLoginForm);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

// Public profile route (no authentication required)
router.get('/:id', userController.getUserById);

// Protected profile routes (require authentication)
router.get('/:id/edit', isAuthenticated, userController.showEditForm);
router.post('/:id/edit', isAuthenticated, userController.updateUser);

module.exports = router;