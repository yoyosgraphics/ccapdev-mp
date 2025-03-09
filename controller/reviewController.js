const db = require('../model/model'); // Adjust path as needed

/*
 * Review Controller Functions
 * - View all reviews
 * - Leave a review on the establishment
 * - Edit the review on the establishment
 * - Find the newly created review
 */

// View all reviews
async function getAllReviews(req, res) {
    try {
        const reviews = await db.getAllReviews();
        
        // For each review, get the restaurant details
        for (let review of reviews) {
            const restaurant = await db.getRestaurantOfID(review.id);
            review.restaurant = restaurant[0];
            
            // Get review comments count
            review.comment_count = await db.getReviewCommentsOfID(review.id).then(comments => comments.length);
        }
        
        res.render('view_review', { 
            title: 'All Reviews',
            reviews: reviews,
            user: req.session.user || null
        });
    } catch (error) {
        res.send(`<script>alert('Failed to retrieve reviews'); window.location.href='/';</script>`);
    }
}

// View reviews for a specific establishment
async function getEstablishmentReviews(req, res) {
    try {
        const id = req.params.id;
        const restaurant = await db.getRestaurantOfID(id);
        
        if (!restaurant || restaurant.length === 0) {
            return res.send(`<script>alert('Establishment not found'); window.location.href='/establishments';</script>`);
        }
        
        const reviews = await db.getRestaurantReviewsOfID(id);
        
        res.render('reviews/establishment', { 
            title: restaurant[0].name + ' Reviews',
            restaurant: restaurant[0],
            reviews: reviews,
            user: req.session.user || null
        });
    } catch (error) {
        res.send(`<script>alert('Failed to retrieve establishment reviews'); window.location.href='/establishments';</script>`);
    }
}

// View a single review
async function getReviewById(req, res) {
    try {
        const id = req.params.id;
        const review = await db.getReviewOfID(id);
        
        if (!review || review.length === 0) {
            return res.send(`<script>alert('Review not found'); window.location.href='/reviews';</script>`);
        }
        
        const restaurant = await db.getRestaurantOfID(review[0].id);
        const comments = await db.getReviewCommentsOfID(id);
        
        // Check if the logged-in user is the owner of this review
        let isOwner = false;
        if (req.session.user) {
            isOwner = req.session.user.username === review[0].username;
        }
        
        res.render('reviews/details', { 
            title: review[0].title,
            review: review[0],
            restaurant: restaurant[0],
            comments: comments,
            isOwner: isOwner,
            user: req.session.user || null
        });
    } catch (error) {
        res.send(`<script>alert('Failed to retrieve review details'); window.location.href='/reviews';</script>`);
    }
}

// Show form to create a new review
async function showCreateForm(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.send(`<script>alert('You must be logged in to leave a review'); window.location.href='/login';</script>`);
        }
        const id = req.params.id; // restaurant id
        const restaurant = await db.getRestaurantOfID(id);
        
        if (!restaurant || restaurant.length === 0) {
            return res.send(`<script>alert('Establishment not found'); window.location.href='/establishments';</script>`);
        }
        
        res.render('reviews/create', {
            title: 'Review ' + restaurant[0].name,
            restaurant: restaurant[0],
            user: req.session.user
        });
    } catch (error) {
        res.send(`<script>alert('Failed to load review form'); window.location.href='/establishments/${req.params.id}';</script>`);
    }
}

// Create a new review
async function createReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.send(`<script>alert('You must be logged in to leave a review'); window.location.href='/login';</script>`);
        }
        const restaurantId = req.params.id;
        const { title, rating, review, image_links } = req.body;
        
        // Validate input
        if (!title || !rating || !review) {
            return res.send(`<script>alert('Please fill in all required fields'); window.location.href='/reviews/establishment/${restaurantId}/create';</script>`);
        }
        
        // Validate rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.send(`<script>alert('Rating must be between 1 and 5'); window.location.href='/reviews/establishment/${restaurantId}/create';</script>`);
        }
        
        // Format current timestamp
        const now = new Date();
        const timestamp = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        // Prepare review object
        const newReview = {
            user: req.session.user.user,
            username: req.session.user.username,
            timestamp: timestamp,
            title: title,
            // Generate an ID for the new review (use your own logic or DB function)
            id: await db.getNextReviewId(),
            rating: parseInt(rating),
            review: review,
            upvotes: 0,
            downvotes: 0,
            has_images: image_links && image_links.length > 0,
            image_links: image_links || [],
            comment_count: 0,
            has_owner_reply: false,
            restaurant_id: restaurantId
        };
        
        // Create review
        await db.addReview(newReview);
        
        res.send(`<script>alert('Review submitted successfully'); window.location.href='/reviews/${newReview.id}';</script>`);
    } catch (error) {
        res.send(`<script>alert('Failed to create review'); window.location.href='/reviews/establishment/${req.params.id}/create';</script>`);
    }
}

// Show form to edit a review
async function showEditForm(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.send(`<script>alert('You must be logged in to edit a review'); window.location.href='/login';</script>`);
        }
        const id = req.params.id;
        const review = await db.getReviewOfID(id);
        
        if (!review || review.length === 0) {
            return res.send(`<script>alert('Review not found'); window.location.href='/reviews';</script>`);
        }
        
        // Check if user is the owner
        if (req.session.user.username !== review[0].username) {
            return res.send(`<script>alert('You do not have permission to edit this review'); window.location.href='/reviews/${id}';</script>`);
        }
        
        const restaurant = await db.getRestaurantOfID(review[0].restaurant_id);
        
        res.render('reviews/edit', {
            title: 'Edit Review',
            review: review[0],
            restaurant: restaurant[0],
            user: req.session.user
        });
    } catch (error) {
        res.send(`<script>alert('Failed to load edit form'); window.location.href='/reviews/${req.params.id}';</script>`);
    }
}

// Update a review
async function updateReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.send(`<script>alert('You must be logged in to update a review'); window.location.href='/login';</script>`);
        }
        const id = req.params.id;
        
        const review = await db.getReviewOfID(id);
        if (!review || review.length === 0) {
            return res.send(`<script>alert('Review not found'); window.location.href='/reviews';</script>`);
        }
        
        // Check if user is the owner
        if (req.session.user.username !== review[0].username) {
            return res.send(`<script>alert('You do not have permission to update this review'); window.location.href='/reviews/${id}';</script>`);
        }
        
        const { title, rating, review: reviewText, image_links } = req.body;
        
        // Validate input
        if (!title || !rating || !reviewText) {
            return res.send(`<script>alert('Please fill in all required fields'); window.location.href='/reviews/${id}/edit';</script>`);
        }
        
        // Validate rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.send(`<script>alert('Rating must be between 1 and 5'); window.location.href='/reviews/${id}/edit';</script>`);
        }
        
        // Update review object
        const updatedReview = {
            ...review[0],
            title: title,
            rating: parseInt(rating),
            review: reviewText,
            has_images: image_links && image_links.length > 0,
            image_links: image_links || review[0].image_links
        };
        
        // Update review in database
        await db.editReviewOfID(id, updatedReview);
        
        res.send(`<script>alert('Review updated successfully'); window.location.href='/reviews/${id}';</script>`);
    } catch (error) {
        res.send(`<script>alert('Failed to update review'); window.location.href='/reviews/${req.params.id}/edit';</script>`);
    }
}

// Like a review
async function likeReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.send(`<script>alert('You must be logged in to like a review'); window.location.href='/login';</script>`);
        }
        const id = req.params.id;
        await db.updateReviewLikesOfID(id, 1);
        
        // Redirect back to the referring page
        const referer = req.get('referer') || '/reviews/' + id;
        res.redirect(referer);
    } catch (error) {
        res.send(`<script>alert('Failed to like review'); window.location.href='/reviews/${req.params.id}';</script>`);
    }
}

// Dislike a review
async function dislikeReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.send(`<script>alert('You must be logged in to dislike a review'); window.location.href='/login';</script>`);
        }
        const id = req.params.id;
        await db.updateReviewDislikesOfID(id, 1);
        
        // Redirect back to the referring page
        const referer = req.get('referer') || '/reviews/' + id;
        res.redirect(referer);
    } catch (error) {
        res.send(`<script>alert('Failed to dislike review'); window.location.href='/reviews/${req.params.id}';</script>`);
    }
}

// Add a comment to a review
async function addComment(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.send(`<script>alert('You must be logged in to comment'); window.location.href='/login';</script>`);
        }
        const reviewId = req.params.id;
        const { comment } = req.body;
        
        // Validate input
        if (!comment) {
            return res.send(`<script>alert('Comment cannot be empty'); window.location.href='/reviews/${reviewId}';</script>`);
        }
        
        // Get next comment ID
        const nextCommentId = await db.getNextCommentId();
        
        // Create comment object
        const newComment = {
            user: req.session.user.user,
            username: req.session.user.username,
            id: nextCommentId,
            review_id: parseInt(reviewId),
            is_owner: false, // Determine if user is restaurant owner
            comment: comment
        };
        
        // Add comment
        await db.addComment(newComment);
        
        res.send(`<script>alert('Comment added successfully'); window.location.href='/reviews/${reviewId}';</script>`);
    } catch (error) {
        res.send(`<script>alert('Failed to add comment'); window.location.href='/reviews/${req.params.id}';</script>`);
    }
}

// Add owner reply to a review
async function addOwnerReply(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.send(`<script>alert('You must be logged in to reply'); window.location.href='/login';</script>`);
        }
        
        const reviewId = req.params.id;
        const { comment } = req.body;
        
        // Validate input
        if (!comment) {
            return res.send(`<script>alert('Reply cannot be empty'); window.location.href='/reviews/${reviewId}';</script>`);
        }
        
        // Check if user is an owner
        if (!req.session.user.isOwner) {
            return res.send(`<script>alert('Only restaurant owners can add owner replies'); window.location.href='/reviews/${reviewId}';</script>`);
        }
        
        // Get the review
        const review = await db.getReviewOfID(reviewId);
        if (!review || review.length === 0) {
            return res.send(`<script>alert('Review not found'); window.location.href='/reviews';</script>`);
        }
        
        // Update the review with owner reply
        const updatedReview = {
            ...review[0],
            has_owner_reply: true,
            owner_name: req.session.user.user,
            owner_username: req.session.user.username,
            owner_reply: comment
        };
        
        // Update review in database
        await db.editReviewOfID(reviewId, updatedReview);
        
        // Also add as a comment
        const nextCommentId = await db.getNextCommentId();
        
        // Create comment object
        const newComment = {
            user: req.session.user.user,
            username: req.session.user.username,
            id: nextCommentId,
            review_id: parseInt(reviewId),
            is_owner: true,
            comment: comment
        };
        
        // Add comment
        await db.addComment(newComment);
        
        res.send(`<script>alert('Owner reply added successfully'); window.location.href='/reviews/${reviewId}';</script>`);
    } catch (error) {
        res.send(`<script>alert('Failed to add owner reply'); window.location.href='/reviews/${req.params.id}';</script>`);
    }
}

// Find newly created review
async function findNewReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.send(`<script>alert('You must be logged in to view your reviews'); window.location.href='/login';</script>`);
        }
        const restaurantId = req.params.id;
        
        // Get all reviews for this restaurant by this user, sorted by newest first
        const reviews = await db.getRestaurantReviewsOfID(restaurantId);
        const userReviews = reviews.filter(review => 
            review.username === req.session.user.username
        );
        
        if (userReviews.length === 0) {
            return res.send(`<script>alert('No reviews found for this establishment'); window.location.href='/establishments/${restaurantId}';</script>`);
        }
        
        // Redirect to the newest review
        res.redirect('/reviews/' + userReviews[0].id);
    } catch (error) {
        res.send(`<script>alert('Failed to find your review'); window.location.href='/establishments/${req.params.id}';</script>`);
    }
}

// Export all functions at the end of the file
module.exports = {
    getAllReviews,
    getEstablishmentReviews,
    getReviewById,
    showCreateForm,
    createReview,
    showEditForm,
    updateReview,
    likeReview,
    dislikeReview,
    addComment,
    addOwnerReply,
    findNewReview
};