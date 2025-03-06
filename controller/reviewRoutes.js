const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.post('/reviews', reviewController.addReview); // Route to add a review

module.exports = router;