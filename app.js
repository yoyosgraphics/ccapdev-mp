//AS OF MARCH 9 10:11 PM
const express = require('express');
const server = express();

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
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/restaurant-review-db')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Session setup for user authentication
const session = require('express-session');
server.use(session({
    secret: 'topnotch-restaurant-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
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

// Define the dataModule for legacy JSON file support
const fs = require('fs');
const path = require('path');

const dataModule = {
    getData: function(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            const data = fs.readFileSync(absolutePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return [];
        }
    },
    saveData: function(filePath, data) {
        try {
            const absolutePath = path.resolve(filePath);
            fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error(`Error writing to file ${filePath}:`, error);
            return false;
        }
    }
};

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

server.get('/search', async function(req, res) {
    try {
        const searchQuery = req.query.q || '';
        const restaurants = searchQuery.trim() !== '' 
            ? await db.getRestaurantWithFilters(searchQuery, undefined, undefined, undefined, undefined)
            : await db.getAllRestaurants();
            
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

// Edit restaurant route - fix to use the array return
server.get('/edit/restaurant/:id', async function(req, res) {
    try {
        // Check if user is logged in and authorized
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
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
        const reviews = await db.getRestaurantReviewsOfID(req.params.id);
        
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
server.get('/view/review/:id/', async function(req, res) {
    try {
        const review = await db.getReviewOfID(req.params.id);
        const comments = await db.getReviewCommentsOfID(req.params.id);
        
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
});

// Create review route - converted to use MongoDB
server.get('/:id/create_review', async function(req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const restaurant = await db.getRestaurantById(req.params.id);

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
        
        const review = await db.getReviewById(req.params.id);
        
        if (!review) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Review Not Found',
                alerts: [{ type: 'error', message: 'Review not found' }]
            });
        }
        
        // Check if user is the author of the review
        if (review.user_id.toString() !== req.session.user._id.toString()) {
            return res.status(403).render('error', {
                layout: 'index',
                title: 'Unauthorized',
                error: 'You are not authorized to edit this review',
                alerts: [{ type: 'error', message: 'Unauthorized access' }]
            });
        }
        
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
        // Check if user is logged in
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const review = await db.getReviewById(req.params.id);
        const comment = await db.getCommentById(req.params.comment_id);
        
        if (!review || !comment) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Not Found',
                alerts: [{ type: 'error', message: 'Review or comment not found' }]
            });
        }
        
        // Check if user is the author of the comment
        if (comment.user_id.toString() !== req.session.user._id.toString()) {
            return res.status(403).render('error', {
                layout: 'index',
                title: 'Unauthorized',
                error: 'You are not authorized to edit this comment',
                alerts: [{ type: 'error', message: 'Unauthorized access' }]
            });
        }
        
        res.render('edit_comment', {
            layout: 'index',
            title: review.title,
            selected: review,
            selectedComment: comment
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
// User profile route
server.get('/profile/:id', async function(req, res) {
    try {
        // Check if user is logged in first
        if (!req.session.user) {
            // Redirect to login page with a return URL
            return res.redirect('/login?returnTo=' + encodeURIComponent('/profile/' + req.params.id));
        }

        const user = await db.getUserID(req.params.id);
        
        if (!user || !Array.isArray(user) || user.length === 0) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'User Not Found',
                logged_in: !!req.session.user,
                show_auth: !req.session.user,
                isLoggedIn: !!req.session.user,
                alerts: [{ type: 'error', message: 'User not found' }]
            });
        }

        // Get the user object from the array
        const userProfile = user[0];
        
        // Log the user profile ID to see what we're working with
        console.log('User Profile ID:', userProfile._id);
        console.log('User Profile ID type:', typeof userProfile._id);
        
        // Ensure we have a proper ID - MongoDB might return ObjectId instead of string
        const userId = userProfile._id.toString();
        console.log('Converted User ID:', userId);
        
        // Use the properly formatted ID for database queries
        const reviews = await db.getAllReviewsOfUser(userId);
        const comments = await db.getAllCommentsOfUser(userId);
        const restaurants = await db.getAllRestaurants();
        
        // Check if any reviews were found
        console.log('Number of reviews found:', reviews ? reviews.length : 0);
        console.log('Number of comments found:', comments ? comments.length : 0);
        
        // Check if the profile belongs to the logged-in user
        const loggedInUserId = req.session.user._id.toString();
        const isOwnProfile = loggedInUserId === userId;

        // Get alerts from query parameters if present
        const alerts = [];
        if (req.query.alert && req.query.message) {
            alerts.push({ type: req.query.alert, message: req.query.message });
        }
        
        res.render('user_profile', {
            layout: 'index',
            title: userProfile.first_name + "'s Profile",
            user: userProfile,
            viewing_user: req.session.user,
            logged_in: true,
            show_auth: false,
            isLoggedIn: true,
            isOwnProfile: isOwnProfile,
            selected: req.query.selected, //|| 'reviews',
            reviews: reviews || [], 
            comments: comments || [],
            restaurants: restaurants || [],
            alerts: alerts
        });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        console.error('Error details:', err.stack); 
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: err.message,
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            isLoggedIn: !!req.session.user,
            alerts: [{ type: 'error', message: 'Failed to load user profile' }]
        });
    }
});

// Edit profile route
server.get('/edit/profile', function(req, res) {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }
    
    res.render('edit_profile', {
        layout: 'index',
        title: 'Edit Profile'
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

server.get('/restaurants/:id/my-review', (req, res) => {
    res.redirect(`/reviews/restaurant/${req.params.id}/my-review`);
});

// Catch-all for 404 errors
server.use((req, res) => {
    res.status(404).render('404', { 
        layout: 'index',
        title: 'Page Not Found',
        alerts: [{ type: 'error', message: 'Page not found' }]
    });
});

// Error handler
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        layout: 'index',
        title: 'Error',
        error: err.message,
        alerts: [{ type: 'error', message: 'Something went wrong' }]
    });
});

// Graceful shutdown handlers
function finalClose() {
    console.log('Close connection at the end!');
    mongoose.connection.close();
    process.exit();
}

process.on('SIGTERM', finalClose);
process.on('SIGINT', finalClose);
process.on('SIGQUIT', finalClose);

// Start server
const port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('Listening at port ' + port);
});

module.exports = server;