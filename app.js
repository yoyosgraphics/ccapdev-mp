const express = require('express');
const server = express();
const connectDB = require('./db');
// Body parser middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Set up handlebars as view engine
const handlebars = require('express-handlebars');
const hbs = handlebars.create({
    extname: 'hbs',
    defaultLayout: 'index',
    helpers: {
        json: function(context) {
            return JSON.stringify(context || []);
        }
    }
});

// Configure view engine
server.set('view engine', 'hbs');
server.engine('hbs', hbs.engine);

// Serve static files from public directory
server.use(express.static('public'));

// Database connection (MongoDB)
// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/restaurant-review-db')
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('MongoDB connection error:', err));

connectDB()
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('Could not connect to MongoDB:', err);
        process.exit(1);
    });

// Session setup for user authentication
const session = require('express-session');
let cookieParser = require('cookie-parser');
server.use(cookieParser());

const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI, 
  collection: 'sessions',
  expires: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
});

server.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key', // Use environment variable
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds
  },
  store: store,
  resave: false,
  saveUninitialized: false
}));

// Make user data available to all templates
server.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.logged_in = !!req.session.user;
    res.locals.show_auth = !req.session.user;
    next();
});

// Debug middleware for session checking
server.use((req, res, next) => {
    console.log("Session check middleware - User:", req.session.user ? 
        `Logged in as ${req.session.user.username}` : "Not logged in");
    next();
});

 // Import routes
const userRoutes = require('./routes/userRoute');
const commentRoute = require('./routes/commentRoute');
const reviewRoute = require('./routes/reviewRoute');
const restaurantRoute = require('./routes/restaurantRoute');

// Import database model
const db = require('./model/model');

// Use route modules
server.use('/users', userRoutes);
server.use('/comments', commentRoute);
server.use('/reviews', reviewRoute);
server.use('/restaurants', restaurantRoute);

// Home route with restaurants data
server.get('/', async function(req, res) {
    try {
        // Get top-rated restaurants from database
        const topRestaurants = await db.getTopNumRestaurants(5); // Gets top 5 restaurants

        res.render('home', {
            layout: 'index',
            title: 'TopNotch',
            restaurants: topRestaurants,
            alerts: []
        });
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.render('home', {
            layout: 'index',
            title: 'TopNotch',
            restaurants: {},
            alerts: [{ type: 'error', message: 'Failed to load restaurants' }]
        });
    }
});

server.get('/register', (req, res) => {
    res.redirect('/users/register');
});

server.get('/login', (req, res) => {
    res.redirect('/users/login');
});

server.get('/logout', (req, res) => {
    res.redirect('/users/logout');
});

server.get('/search', async function(req, res) {
    try {
        const searchQuery = req.query.q || '';
        const restaurants = searchQuery.trim() !== '' 
            ? await db.getRestaurantWithFilters(searchQuery, undefined, undefined, undefined, undefined)
            : await db.getAllRestaurants();

        console.log(restaurants);
            
        res.render('search', {
            layout: 'index',
            title: (searchQuery.trim() !== '') ? searchQuery : "Search for your next meal",
            searchQuery: searchQuery,
            hasQuery: searchQuery.trim() !== '',
            restaurants: restaurants
        });
    } catch (err) {
        console.error('Error searching restaurants:', err);
        res.render('search', {
            layout: 'index',
            title: "Search Error",
            searchQuery: req.query.q || '',
            hasQuery: false,
            restaurants: [],
            alerts: [{ type: 'error', message: 'Failed to search restaurants' }]
        });
    }
});

server.post('/ajax_response_restaurants', async function(req, resp){
        let type = req.body.type;
        let rating = req.body.rating;
        let pricing_from = req.body.pricing_from;
        let pricing_to = req.body.pricing_to;
        let searchQuery = req.body.searchQuery;
        let restaurants = await db.getRestaurantWithFilters(searchQuery, type, rating, pricing_from, pricing_to);
        resp.json(restaurants);
})

server.post('/ajax_response_reviews', async function(req, resp){
    let content = req.body.content || undefined;
    let restaurant_id = req.body.id;
    let reviews = await db.searchReviews(restaurant_id, content);
    resp.json(reviews);
})

// Edit restaurant route - fix to use the array return
server.get('/edit/restaurant/:id', async function(req, res) {
    try {        
        const restaurants = await db.getRestaurantOfID(req.params.id);
        
        if (!restaurants || restaurants.length === 0) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Restaurant Not Found',
                alerts: [{ type: 'error', message: 'Restaurant not found' }]
            });
        }
        
        const restaurant = restaurants[0];
        
        res.render('edit_restaurant', {
            layout: 'index',
            title: 'Edit ' + restaurant.name,
            selected: restaurant
        });
    } catch (err) {
        console.error('Error fetching restaurant:', err);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: err.message,
            alerts: [{ type: 'error', message: 'Failed to load restaurant' }]
        });
    }
});

server.get('/view/restaurant/:id/', async function(req, res) {
    try {
        const restaurants = await db.getRestaurantOfID(req.params.id);
        
        if (!restaurants || restaurants.length === 0) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Restaurant Not Found',
                alerts: [{ type: 'error', message: 'Restaurant not found' }]
            });
        }
        
        const restaurant = restaurants[0]; // The function returns an array, so get the first item

        if (res.locals.logged_in) {
            if (await db.checkUserRestaurantOwner(res.locals.user._id, restaurant._id)) {
                restaurant.owner = true;
            } else {
                restaurant.owner = false;
            }
        } else {
            restaurant.owner = false;
        }

        const reviews = await db.getRestaurantReviewsOfID(req.params.id);
        console.log("reviews: ", reviews);
        res.render('view_restaurant', {
            layout: 'index',
            title: restaurant.name,
            selected: restaurant,
            reviews: reviews
        });
    } catch (err) {
        console.error('Error fetching restaurant:', err);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: err.message,
            alerts: [{ type: 'error', message: 'Failed to load restaurant' }]
        });
    }
});


// Fix in getReviewById - need to ensure we're calling the correct function
server.get('/view_review/:id/', async function(req, res) {
    try {
        // Fetch review data based on the review ID
        const review = await db.getReviewOfID(req.params.id);
        
        // If no review is found, handle the error
        if (!review) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Review Not Found',
                alerts: [{ type: 'error', message: 'Review not found' }]
            });
        }
        
        // Fetch comments for the review
        const comments = await db.getReviewCommentsOfID(req.params.id);

        comments.forEach(async comment => {
            if (res.locals.logged_in) {
                if (await db.checkUserCommentOwner(res.locals.user._id, comment._id)) {
                    comment.author = true;
                } else {
                    comment.author = false;
                }
            } else {
                comment.author = false;
            }
        });
        console.log("Comments", comments);

        review.owner = false;

        if (res.locals.logged_in)
            if (await db.checkUserReviewOwner(res.locals.user.id, review.id))
                review.owner = true;

        console.log('Review:', review);
        res.render('view_review', {
            layout: 'index',
            title: review.title,
            review: review,
            comments: comments,
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
});

server.get('/edit/review/:id', async function(req, res) {
    try {
        const reviewId = req.params.id;
        console.log('Review ID:', reviewId);  // Log the review ID received in the URL

        // Fetch the review by ID
        const review = await db.getReviewOfID(reviewId);

        // Log the review data to check if it's correct
        console.log('Fetched Review:', review);

        // Check if the review exists
        if (!review) {
            return res.status(404).render('error', {
                layout: 'index',
                title: 'Review Not Found',
                error: 'Review not found or deleted'
            });
        }

        // Check if the logged-in user is the owner of the review
        console.log("review: ", review);
        console.log("Logged-in user:",  review.user_id._id.toString());
        console.log("User Owner: ", res.locals.user._id.toString());
        if (review.user_id._id.toString() !== res.locals.user._id.toString()) {
            return res.status(403).render('error', {
                layout: 'index',
                title: 'Forbidden',
                error: 'You do not have permission to edit this review.'
            });
        }

        // Pass the review data to the template
        res.render('edit_review', {
            layout: 'index',
            selected: review,  // Pass the review as 'selected'
        });

    } catch (err) {
        console.error('Error fetching review for editing:', err);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: 'Failed to fetch review for editing',
            alerts: [{ type: 'error', message: 'An error occurred while fetching the review data.' }]
        });
    }
});


// Delete review route
server.delete('/delete/review/:id', async (req, res) => {
    const reviewId = req.params.id;
    
    const result = await db.deleteReviewById(reviewId);
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});



// Create review route - converted to use MongoDB
server.get('/:id/create_review', async function(req, res) {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const restaurantArray = await db.getRestaurantOfID(req.params.id);
        
        
        const restaurant = restaurantArray[0];

        if (!restaurant) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Restaurant Not Found',
                alerts: [{ type: 'error', message: 'Restaurant not found' }]
            });
        }

        res.render('create_review', {
            layout: 'index',
            title: "Write a Review",
            selected: restaurant
        });
    } catch (err) {
        console.error('Error fetching restaurant:', err);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: err.message,
            alerts: [{ type: 'error', message: 'Failed to load restaurant' }]
        });
    }
});

// Edit review route - converted to use MongoDB
server.get('/edit/review/:id', async function(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const review = await db.getReviewOfID(req.params.id);
        
        if (!review) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Review Not Found',
                alerts: [{ type: 'error', message: 'Review not found' }]
            });
        }
        
        console.log("Review: ", review);

        res.render('edit_review', {
            layout: 'index',
            title: "Edit Your Review",
            selected: review
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
});

// Edit comment route - converted to use MongoDB
server.get('/view/reviews/:id/edit/:comment_id', async function(req, res) {
    try {        
        const review = await db.getReviewOfID(req.params.id);
        const comments = await db.getReviewCommentsOfID(req.params.id);

        comments.forEach(async comment => {
            if (res.locals.logged_in) {
                if (await db.checkUserCommentOwner(res.locals.user._id, comment._id)) {
                    comment.author = true;
                } else {
                    comment.author = false;
                }
            } else {
                comment.author = false;
            }
        });

        const comment = await db.getCommentOfID(req.params.comment_id);
        
        if (!review || !comment) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Not Found',
                alerts: [{ type: 'error', message: 'Review or comment not found' }]
            });
        }

        res.render('edit_comment', {
            layout: 'index',
            title: review.title,
            selected: review,
            selectedComment: comment,
            comments: comments
        });
    } catch (err) {
        console.error('Error fetching comment:', err);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: err.message,
            alerts: [{ type: 'error', message: 'Failed to load comment' }]
        });
    }
});

server.post('/edit/review/:id', async (req, res) => {
    const { title, content, rating, picture_addresses } = req.body;
    const reviewId = req.params.id;

    console.log('Request Data:', req.body);  // Check the data here

    // Ensure the individual fields are correctly handled
    const updatedReviewData = {
        title: String(title),  // Ensure title is a string
        content: String(content),  // Ensure content is a string
        rating: Number(rating),  // Ensure rating is a number
        picture_addresses: picture_addresses || [""],  // Default to empty string if no pictures
    };

    try {
        const updatedReview = await db.editReviewOfID(
            reviewId,
            title,
            rating,
            content,
            picture_addresses || [''] // Ensure it's always an array
        );
        res.redirect(`/view_review/${reviewId}`);  // Redirect to the updated review page
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating review.");
    }
});

// User profile route
server.get('/users/:id', async function (req, res) {
    try {
        // Fetch user profile
        const userProfile = await db.getUserID(req.params.id);

        // Handle user not found
        if (!userProfile || !Array.isArray(userProfile) || userProfile.length === 0) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'User Not Found',
                user: req.session.user || null,  // Pass the logged-in user
                logged_in: !!req.session.user,
                show_auth: !req.session.user,
                alerts: [{ type: 'error', message: 'User not found' }]
            });
        }

        // Get the user object from the array
        const profileData = userProfile[0];

        // Format the user ID properly
        const userId = profileData._id.toString();

        // Fetch related data
        const reviews = await db.getAllReviewsOfUser(userId);
        const comments = await db.getAllCommentsOfUser(userId);
        const restaurants = await db.getAllRestaurantsOfUser(userId);

        // Check if viewer is logged in and if they own the profile
        let isOwnProfile = false;
        if (req.session.user && req.session.user._id) {
            const loggedInUserId = req.session.user._id.toString();
            isOwnProfile = (loggedInUserId === userId);
        }

        // Prepare alerts if any
        const alerts = [];
        if (req.query.alert && req.query.message) {
            alerts.push({ type: req.query.alert, message: req.query.message });
        }

        res.render('user_profile', {
            layout: 'index',
            title: profileData.first_name + "'s Profile",
            user: req.session.user || null,       // The currently logged-in user (for navigation)
            profile_user: profileData,            // The user whose profile is being viewed
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            isOwnProfile: isOwnProfile,
            selected: req.query.selected || 'reviews',
            reviews: reviews || [],
            comments: comments || [],
            restaurants: restaurants || [],
            alerts: alerts
        });

    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: err.message,
            user: req.session.user || null,  // Pass the logged-in user
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            alerts: [{ type: 'error', message: 'Failed to load user profile' }]
        });
    }
});



// Edit profile route
server.get('/edit/profile', function(req, res) {
    
    res.render('edit_profile', {
        layout: 'index',
        title: 'Edit Profile'
    });
});

// About Page
server.get('/about', async function(req, res) {
        
    res.render('about', {
        layout: 'index'
    });
});

// Redirects for restaurant-specific review routes
server.get('/restaurants/:id/reviews', (req, res) => {
    res.redirect(`/reviews/restaurant/${req.params.id}`);
});

server.get('/restaurants/:id/reviews/create', (req, res) => {
    res.redirect(`/reviews/restaurant/${req.params.id}/create`);
});

server.post('/restaurants/:id/reviews/create', (req, res) => {
    // Forward the POST request with body data
    req.url = `/reviews/restaurant/${req.params.id}/create`;
    server._router.handle(req, res);
});

server.post('/archive/:restaurantId', async (req, res) => {
    console.log("Archive route hit! Restaurant ID:", req.params.restaurantId);

    try {
        const result = await db.archiveRestaurantById(req.params.restaurantId);
        console.log(result);

        if (result) {
            console.log("Archiving successful!");  // Debugging
            return res.json({ success: true });
        } else {
            console.log("Archiving failed!");  // Debugging
            return res.json({ success: false, message: "Could not archive restaurant." });
        }
    } catch (error) {
        console.error("Error in archive route:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
});


server.get('/restaurants/:id/my-review', (req, res) => {
    res.redirect(`/reviews/restaurant/${req.params.id}/my-review`);
});

server.post("/restaurants/:id/submit-review", (req, res) => {
    const { rating, title, content, selectedImage1, selectedImage2 } = req.body;
    const user_id = req.session.user._id; // Assuming user object is stored with _id in session

    console.log("User ID: ", user_id);  // Debugging
    console.log("Form Data Received:", req.body);  // Debugging
    console.log("Received Image 1:", selectedImage1);
    console.log("Received Image 2:", selectedImage2);

    // Replace "noPicture.png" with null to ensure we don't save that as an image path
    const selectedImages = [selectedImage1, selectedImage2].map(img => 
        img === "/common/noPicture.png" ? null : img
    ).filter(img => img !== null);  // Remove null values

    console.log("Filtered Images: ", selectedImages);  // Debugging the filtered images

    // Call the addReview function, passing the user_id and selected images
    db.addReview(user_id, req.params.id, title, rating, content, selectedImages)
        .then(() => {
            console.log("Review submitted successfully.");
            res.redirect(`/restaurants/${req.params.id}`);
        })
        .catch(err => {
            console.error("Error submitting review:", err);
            res.status(400).send("Error submitting review.");
        });
});

// Graceful shutdown handlers
//function finalClose() {
//    console.log('Close connection at the end!');
//    mongoose.connection.close();
//   process.exit();
//}

// process.on('SIGTERM', finalClose);
// process.on('SIGINT', finalClose);
// process.on('SIGQUIT', finalClose);

// Start server
const port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('Listening at port ' + port);
});

module.exports = server;
