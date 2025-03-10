const model = require('../model/model');
console.log("Comment Controller:");
// Controller for adding a new comment to a review
const addCommentToReview = async (req, res) => {
    try {
        const { user_id, review_id, content } = req.body;

        // Validate required fields
        if (!user_id || !review_id || !content) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: user_id, review_id, and content are required",
                alert: {
                    type: 'danger',
                    message: "Missing required fields: user_id, review_id, and content are required"
                }
            });
        }

        // Validate content
        if (content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Comment content cannot be empty",
                alert: {
                    type: 'danger',
                    message: "Comment content cannot be empty"
                }
            });
        }

        // Check if review exists
        const review = await model.getReviewOfID(review_id);
        if (!review || review.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
                alert: {
                    type: 'danger',
                    message: "Review not found"
                }
            });
        }

        // Add the comment
        await model.addComment(user_id, review_id, content);
        
        // Set success alert and redirect back to the review page
        return res.redirect(`/views/view_review/${review_id}?alert=Comment added successfully&type=success`);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({
            success: false,
            message: "Server error while adding comment",
            alert: {
                type: 'danger',
                message: "Server error while adding comment"
            }
        });
    }
};

// View a review with its comments
const viewReviewWithComments = async (req, res) => {
    try {
        const { review_id } = req.params;
        const user_id = req.session?.user_id; // Assuming you store user_id in session
        
        // Get alert from query parameters if any
        const alert = req.query.alert ? {
            type: req.query.type || 'info',
            message: req.query.alert
        } : null;
        
        // Get review details
        const review = await model.getReviewOfID(review_id);
        if (!review || review.length === 0) {
            return res.status(404).render('error', {
                message: "Review not found",
                alert: {
                    type: 'danger',
                    message: "Review not found"
                }
            });
        }
        
        // Get comments for the review using the model function directly
        const comments = await model.getReviewCommentsOfID(review_id);
        
        // Check if the user is the owner of the review
        let isReviewOwner = false;
        if (user_id && review[0].user_id._id) {
            isReviewOwner = await model.compareID(user_id, review[0].user_id._id);
        }
        
        // Render the review view with comments
        res.render('view_review', {
            selected: {
                ...review[0],
                is_owner: isReviewOwner,
                comment_count: comments.length
            },
            comments: comments,
            user_id: user_id,
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            alert: alert // Pass alert to the template
        });
    } catch (error) {
        console.error("Error viewing review with comments:", error);
        res.status(500).render('error', {
            message: "Server error while viewing review",
            alert: {
                type: 'danger',
                message: "Server error while viewing review"
            }
        });
    }
};
const editComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const user_id = req.session?.user_id; 

        // Validate the comment_id is provided
        if (!comment_id) {
            return res.redirect('/home?alert=Comment ID is required&type=danger');
        }

        // Get the comment to edit
        const selectedComment = await model.getCommentOfID(comment_id);
        
        if (!selectedComment) {
            return res.redirect('/home?alert=Comment not found&type=danger');
        }

        // Verify the user is the comment owner
        if (!await model.compareID(user_id, selectedComment.user_id._id)) {
            return res.redirect(`/views/view_review/${selectedComment.review_id}?alert=You can only edit your own comments&type=danger`);
        }

        // Get the review details
        const review_id = selectedComment.review_id;
        const review = await model.getReviewById(review_id);
        
        // Get all comments for this review
        const comments = await model.getCommentsByReviewId(review_id);

        // Render the edit comment view
        return res.render('edit_comment', {
            selected: review,  
            selectedComment: selectedComment,  
            comment: {  
                comment: selectedComment.content
            },
            comments: comments,
            alert: req.query.alert ? {
                message: req.query.alert,
                type: req.query.type || 'info'
            } : null
        });
    } catch (error) {
        console.error("Error rendering edit comment view:", error);
        return res.redirect('/home?alert=Server error while loading comment edit page&type=danger');
    }
};
const processEditComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const { content } = req.body;
        const user_id = req.session?.user_id;

        // Validate content
        if (!content || content.trim() === '') {
            return res.redirect(`/comment/edit/${comment_id}?alert=Comment content cannot be empty&type=danger`);
        }

        // Get comment details
        const selectedComment = await model.getCommentOfID(comment_id);
        if (!selectedComment) {
            return res.redirect(`/home?alert=Comment not found&type=danger`);
        }

        // Check if user is the owner of the comment
        if (!await model.compareID(user_id, selectedComment.user_id._id)) {
            return res.redirect(`/views/view_review/${selectedComment.review_id}?alert=You can only edit your own comments&type=danger`);
        }

        // Update comment
        await model.updateComment(comment_id, content);

        return res.redirect(`/views/view_review/${selectedComment.review_id}?alert=Comment successfully edited&type=success`);
    } catch (error) {
        console.error("Error processing comment edit:", error);
        return res.redirect('/home?alert=Server error while editing comment&type=danger');
    }
};

module.exports = {
    addCommentToReview,
    viewReviewWithComments,
    editComment,
    processEditComment  
};
