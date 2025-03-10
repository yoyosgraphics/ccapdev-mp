const db = require('../model/model'); // Adjust path as needed
console.log("Review Controller:");
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
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            user: req.session.user || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve reviews",
            alert: {
                type: 'danger',
                message: "Failed to retrieve reviews"
            }
        });
    }
}

// View reviews for a specific restaurant
async function getRestaurantReviews(req, res) {
    try {
        const id = req.params.id;
        const restaurant = await db.getRestaurantOfID(id);
        
        if (!restaurant || restaurant.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
                alert: {
                    type: 'danger',
                    message: "Restaurant not found"
                }
            });
        }
        
        const reviews = await db.getRestaurantReviewsOfID(id);
        
        res.render('reviews/restaurant', { 
            title: restaurant[0].name + ' Reviews',
            restaurant: restaurant[0],
            reviews: reviews,
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            user: req.session.user || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve restaurant reviews",
            alert: {
                type: 'danger',
                message: "Failed to retrieve restaurant reviews"
            }
        });
    }
}

// View a single review
async function getReviewById(req, res) {
    try {
        const id = req.params.id;
        const review = await db.getReviewOfID(id);
        
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
            isOwner: true, // hard-coded for now
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            user: req.session.user || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve review details",
            alert: {
                type: 'danger',
                message: "Failed to retrieve review details"
            }
        });
    }
}

// Show form to create a new review
async function showCreateForm(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to leave a review",
                alert: {
                    type: 'danger',
                    message: "You must be logged in to leave a review"
                }
            });
        }
        const id = req.params.id; // restaurant id
        const restaurant = await db.getRestaurantOfID(id);
        
        if (!restaurant || restaurant.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
                alert: {
                    type: 'danger',
                    message: "Restaurant not found"
                }
            });
        }
        
        res.render('reviews/create', {
            title: 'Review ' + restaurant[0].name,
            restaurant: restaurant[0],
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            user: req.session.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load review form",
            alert: {
                type: 'danger',
                message: "Failed to load review form"
            }
        });
    }
}

// Create a new review
async function createReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to leave a review",
                alert: {
                    type: 'danger',
                    message: "You must be logged in to leave a review"
                }
            });
        }
        const restaurantId = req.params.id;
        const { title, rating, review, image_links } = req.body;
        
        // Validate input
        if (!title || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields",
                alert: {
                    type: 'danger',
                    message: "Please fill in all required fields"
                }
            });
        }
        
        // Validate rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
                alert: {
                    type: 'danger',
                    message: "Rating must be between 1 and 5"
                }
            });
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
            likes: 0,
            dislikes: 0,
            has_images: image_links && image_links.length > 0,
            image_links: image_links || [],
            comment_count: 0,
            has_owner_reply: false,
            restaurant_id: restaurantId
        };
        
        // Create review
        await db.addReview(newReview);
        
        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            reviewId: newReview.id,
            alert: {
                type: 'success',
                message: "Review submitted successfully"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create review",
            alert: {
                type: 'danger',
                message: "Failed to create review"
            }
        });
    }
}

// Show form to edit a review
async function showEditForm(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to edit a review",
                alert: {
                    type: 'danger',
                    message: "You must be logged in to edit a review"
                }
            });
        }
        const id = req.params.id;
        const review = await db.getReviewOfID(id);
        
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
        
        // Check if user is the owner
        if (req.session.user.username !== review[0].username) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to edit this review",
                alert: {
                    type: 'danger',
                    message: "You do not have permission to edit this review"
                }
            });
        }
        
        const restaurant = await db.getRestaurantOfID(review[0].restaurant_id);
        
        res.render('reviews/edit', {
            title: 'Edit Review',
            review: review[0],
            restaurant: restaurant[0],
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            user: req.session.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load edit form",
            alert: {
                type: 'danger',
                message: "Failed to load edit form"
            }
        });
    }
}

// Update a review
async function updateReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to update a review",
                alert: {
                    type: 'danger',
                    message: "You must be logged in to update a review"
                }
            });
        }
        const id = req.params.id;
        
        const review = await db.getReviewOfID(id);
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
        
        // Check if user is the owner
        if (req.session.user.username !== review[0].username) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update this review",
                alert: {
                    type: 'danger',
                    message: "You do not have permission to update this review"
                }
            });
        }
        
        const { title, rating, review: reviewText, image_links } = req.body;
        
        // Validate input
        if (!title || !rating || !reviewText) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields",
                alert: {
                    type: 'danger',
                    message: "Please fill in all required fields"
                }
            });
        }
        
        // Validate rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
                alert: {
                    type: 'danger',
                    message: "Rating must be between 1 and 5"
                }
            });
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
        
        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            alert: {
                type: 'success',
                message: "Review updated successfully"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update review",
            alert: {
                type: 'danger',
                message: "Failed to update review"
            }
        });
    }
}

// Like a review
async function likeReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to like a review",
                alert: {
                    type: 'danger',
                    message: "You must be logged in to like a review"
                }
            });
        }
        const id = req.params.id;
        await db.updateReviewLikesOfID(id, 1);
        
        res.status(200).json({
            success: true,
            message: "Review liked successfully",
            alert: {
                type: 'success',
                message: "Review liked successfully"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to like review",
            alert: {
                type: 'danger',
                message: "Failed to like review"
            }
        });
    }
}

// Dislike a review
async function dislikeReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to dislike a review",
                alert: {
                    type: 'danger',
                    message: "You must be logged in to dislike a review"
                }
            });
        }
        const id = req.params.id;
        await db.updateReviewDislikesOfID(id, 1);
        
        res.status(200).json({
            success: true,
            message: "Review disliked successfully",
            alert: {
                type: 'success',
                message: "Review disliked successfully"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to dislike review",
            alert: {
                type: 'danger',
                message: "Failed to dislike review"
            }
        });
    }
}

// Add a comment to a review
async function addComment(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to comment",
                alert: {
                    type: 'danger',
                    message: "You must be logged in to comment"
                }
            });
        }
        const reviewId = req.params.id;
        const { comment } = req.body;
        
        // Validate input
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty",
                alert: {
                    type: 'danger',
                    message: "Comment cannot be empty"
                }
            });
        }
        
        // Create comment object in MongoDB format
        const newComment = {
            user_id: req.session.user._id, // Assuming user has _id in session
            review_id: reviewId, 
            content: comment,
            edit_status: false,
            delete_status: false
        };
        
        // Add comment
        await db.addComment(newComment);
        
        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            alert: {
                type: 'success',
                message: "Comment added successfully"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add comment",
            alert: {
                type: 'danger',
                message: "Failed to add comment"
            }
        });
    }
}

// Add owner reply to a review
async function addOwnerReply(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to reply",
                alert: {
                    type: 'danger',
                    message: "You must be logged in to reply"
                }
            });
        }
        
        const reviewId = req.params.id;
        const { comment } = req.body;
        
        // Validate input
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Reply cannot be empty",
                alert: {
                    type: 'danger',
                    message: "Reply cannot be empty"
                }
            });
        }
        
        // Check if user is an owner
        if (!req.session.user.isOwner) {
            return res.status(403).json({
                success: false,
                message: "Only restaurant owners can add owner replies",
                alert: {
                    type: 'danger',
                    message: "Only restaurant owners can add owner replies"
                }
            });
        }
        
        // Get the review
        const review = await db.getReviewOfID(reviewId);
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
        
        const newComment = {
            user_id: req.session.user._id, // Assuming user has _id in session
            review_id: reviewId, 
            content: comment,
            edit_status: false,
            delete_status: false,
            is_owner: true
        };
        
        // Add comment
        await db.addComment(newComment);
        
        res.status(201).json({
            success: true,
            message: "Owner reply added successfully",
            alert: {
                type: 'success',
                message: "Owner reply added successfully"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add owner reply",
            alert: {
                type: 'danger',
                message: "Failed to add owner reply"
            }
        });
    }
}

// Find newly created review
async function findNewReview(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to view your reviews",
                alert: {
                    type: 'danger',
                    message: "You must be logged in to view your reviews"
                }
            });
        }
        const restaurantId = req.params.id;
        
        // Get all reviews for this restaurant by this user, sorted by newest first
        const reviews = await db.getRestaurantReviewsOfID(restaurantId);
        const userReviews = reviews.filter(review => 
            review.username === req.session.user.username
        );
        
        if (userReviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No reviews found for this restaurant",
                alert: {
                    type: 'warning',
                    message: "No reviews found for this restaurant"
                }
            });
        }
        
        // Return info about the newest review
        res.status(200).json({
            success: true,
            reviewId: userReviews[0].id,
            message: "Review found",
            alert: {
                type: 'success',
                message: "Review found"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to find your review",
            alert: {
                type: 'danger',
                message: "Failed to find your review"
            }
        });
    }
}

const viewReview = async (req, res) => {
    const reviewId = req.params.id;

    if (!reviewId || isNaN(reviewId)) {
        return res.status(400).render('error', {
            layout: 'index',
            title: 'Invalid Review ID',
            alerts: [{ type: 'error', message: 'Invalid review ID provided' }]
        });
    }

    try {
        const review = await Review.getReviewById(reviewId);
        const comments = await Review.getReviewCommentsById(reviewId);

        if (!review) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Review Not Found',
                alerts: [{ type: 'error', message: 'Review not found' }]
            });
        }

        res.render('view_review', {
            layout: 'index',
            title: review.title,
            selected: review,
            comments: comments
        });

    } catch (err) {
        console.error('Error fetching review:', err);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: err.message,
            alerts: [{ type: 'error', message: 'Failed to load review' }]
        });
    }
};

module.exports = {
    getAllReviews,
    getRestaurantReviews,
    getReviewById,
    showCreateForm,
    createReview,
    showEditForm,
    updateReview,
    likeReview,
    dislikeReview,
    addComment,
    addOwnerReply,
    findNewReview,
    viewReview
};