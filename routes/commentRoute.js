const express = require('express');
const router = express.Router();
const commentController = require('../controller/commentController');


router.get('/view_review/:review_id/:comment_id', commentController.viewReviewWithComments);
router.post('/add', commentController.addCommentToReview);
router.get('/comment/edit/:comment_id', commentController.editComment);
router.post('/comment/edit/:comment_id', commentController.processEditComment);


module.exports = router;