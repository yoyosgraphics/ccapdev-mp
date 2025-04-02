const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');

// Review routes - general
router.get('/', reviewController.getAllReviews);

// Restaurant-specific review routes
router.get('/restaurant/:id', reviewController.getRestaurantReviews);
router.get('/restaurant/:id/create', reviewController.showCreateForm);
router.post('/restaurant/:id/create', reviewController.createReview);
router.get('/restaurant/:id/my-review', reviewController.findNewReview);

// Individual review routes
router.get('/:id', reviewController.getReviewById);
router.get('/:id/edit', reviewController.showEditForm);
router.put('/:id', reviewController.updateReview);  
router.post('/:id/comment', reviewController.addComment);
router.post('/:id/owner-reply', reviewController.addOwnerReply);
router.get('/view_review/:id/', reviewController.viewReview);

router.post('/:review_id/like', reviewController.likeReview);
router.post('/:review_id/dislike', reviewController.dislikeReview);
router.post('/:review_id/remove-reaction', reviewController.removeReaction);
router.get('/:review_id/user-reaction', reviewController.getUserReactionReview);

module.exports = router;