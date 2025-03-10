const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');

// Review routes - general
router.get('/', reviewController.getAllReviews);

// Restaurant-specific review routes
router.get('/restaurant/:id', reviewController.getrestaurantReviews);
router.get('/restaurant/:id/create', reviewController.showCreateForm);
router.post('/restaurant/:id/create', reviewController.createReview);
router.get('/restaurant/:id/my-review', reviewController.findNewReview);

// Individual review routes
router.get('/:id', reviewController.getReviewById);
router.get('/:id/edit', reviewController.showEditForm);
router.put('/:id', reviewController.updateReview);  
router.post('/:id/like', reviewController.likeReview);
router.post('/:id/dislike', reviewController.dislikeReview);
router.post('/:id/comment', reviewController.addComment);
router.post('/:id/owner-reply', reviewController.addOwnerReply);

module.exports = router;