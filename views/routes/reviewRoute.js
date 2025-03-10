const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');

// Review routes - general
router.get('/', reviewController.getAllReviews);

// Establishment-specific review routes
router.get('/establishment/:id', reviewController.getEstablishmentReviews);
router.get('/establishment/:id/create', reviewController.showCreateForm);
router.post('/establishment/:id/create', reviewController.createReview);
router.get('/establishment/:id/my-review', reviewController.findNewReview);

// Individual review routes
router.get('/:id', reviewController.getReviewById);
router.get('/:id/edit', reviewController.showEditForm);
router.put('/:id', reviewController.updateReview);  
router.post('/:id/like', reviewController.likeReview);
router.post('/:id/dislike', reviewController.dislikeReview);
router.post('/:id/comment', reviewController.addComment);
router.post('/:id/owner-reply', reviewController.addOwnerReply);

module.exports = router;