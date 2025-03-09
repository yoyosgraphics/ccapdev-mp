const express = require('express');
const router = express.Router();
const commentController = require('../controller/commentController');
const authMiddleware = require('../middleware/auth'); // Assuming you have auth middleware

// Route to view a review with its comments
router.get('/view_review/:review_id', commentController.viewReviewWithComments);

// Route to add a comment to a review
router.post('/comment/add', authMiddleware.requireLogin, commentController.addCommentToReview);


module.exports = router;
