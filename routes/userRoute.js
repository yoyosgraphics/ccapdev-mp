const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/'); // Make sure this directory exists
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, uniqueSuffix + '.' + ext);
  }
});

// Set up file filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

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
router.post('/register', upload.single('picture_address'), userController.register);

// Login routes
router.get('/login', userController.showLoginForm);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

// Public profile route (no authentication required)
router.get('/:id', userController.getUserById);

// Protected profile routes (require authentication AND ownership)
router.get('/:id/edit', isAuthenticated, isOwnProfile, userController.showEditForm);
router.post('/:id/edit', isAuthenticated, isOwnProfile, upload.single('picture_address'), userController.updateUser);

module.exports = router;