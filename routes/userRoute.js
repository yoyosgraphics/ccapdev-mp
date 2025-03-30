const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Configure as needed
const path = require('path');

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//       cb(null, path.join(__dirname, '../uploads'));
//   },
//   filename: function(req, file, cb) {
//       cb(null, 'temp-' + Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
//   fileFilter: (req, file, cb) => {
//       const allowedFileTypes = /jpeg|jpg|png/;
//       const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
//       const mimetype = allowedFileTypes.test(file.mimetype);

//       if (extname && mimetype) {
//           return cb(null, true);
//       } else {
//           cb('Error: Only images are allowed');
//       }
//   }
// });

// Set up file filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Middleware to add login status to all routes
router.use((req, res, next) => {
  // Add isLoggedIn variable to all responses
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.currentUser = req.session.user || null;
  next();
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
        isLoggedIn: !!req.session.user,
        alerts: [{ type: 'error', message: 'You can only edit your own profile' }]
      });
    }
  } catch (error) {
    console.error("Error in isOwnProfile middleware:", error);
    res.status(500).render('error', {
      error: 'An error occurred while checking permissions',
      logged_in: !!req.session.user,
      show_auth: !req.session.user,
      isLoggedIn: !!req.session.user,
      alerts: [{ type: 'error', message: 'An error occurred while checking permissions' }]
    });
  }
};

const ensureLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }

  return res.redirect('/');
};

// Registration routes
router.get('/register', userController.showRegisterForm);
router.post('/register-first-page', userController.registerOne);
router.post('/register-last-page', upload.single('picture_address'), userController.register);
// Login routes
router.get('/login', userController.showLoginForm);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

// User profile routes
router.get('/users/:id', ensureLoggedIn, userController.getUserById);

// Protected profile routes (require authentication AND ownership)
router.get('/users/:id/edit', isAuthenticated, isOwnProfile, userController.showEditForm);
router.post('/users/:id/edit', isAuthenticated, isOwnProfile, upload.single('picture_address'), userController.updateUser);

module.exports = router;