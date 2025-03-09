const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login?alert=error&message=' + encodeURIComponent('Please log in to access this page'));
  }
};

// Middleware to check if user is editing their own profile
const isOwnProfile = (req, res, next) => {
  try {
    const loggedInUserId = req.session.user ? (req.session.user._id || '').toString() : '';
    const profileUserId = (req.params.id || '').toString();
    
    if (req.session.user && loggedInUserId === profileUserId) {
      next();
    } else {
      res.status(403).render('error', { 
        error: 'Unauthorized',
        logged_in: !!req.session.user,
        show_auth: !req.session.user,
        alerts: [{ type: 'error', message: 'You can only edit your own profile' }]
      });
    }
  } catch (error) {
    console.error("Error in isOwnProfile middleware:", error);
    res.status(500).render('error', {
      error: 'An error occurred while checking permissions',
      logged_in: !!req.session.user,
      show_auth: !req.session.user,
      alerts: [{ type: 'error', message: 'An error occurred while checking permissions' }]
    });
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

// Protected profile routes (require authentication AND ownership)
router.get('/:id/edit', isAuthenticated, isOwnProfile, userController.showEditForm);
router.post('/:id/edit', isAuthenticated, isOwnProfile, userController.updateUser);

module.exports = router;