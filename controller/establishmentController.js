const db = require('../model/model'); // Adjust path as needed
console.log("Establisment Controller:");
const displayHome = async (req, res) => {
    try {
        // Get all restaurants from database using the model
        const allRestaurants = await db.getAllRestaurants();

        // Group restaurants by category
        const restaurants = {};
        
        // If we have restaurants, group them by category
        if (allRestaurants && allRestaurants.length > 0) {
            allRestaurants.forEach(restaurant => {
                const category = restaurant.type || 'Uncategorized';
                
                if (!restaurants[category]) {
                    restaurants[category] = [];
                }
                
                restaurants[category].push({
                    id: restaurant._id,
                    name: restaurant.name,
                    type: restaurant.type,
                    picture_address: restaurant.picture_address,
                    rating: restaurant.rating || 0
                });
            });
        }
        
        res.render('home', {
            layout: 'index',
            title: 'TopNotch',
            restaurants: restaurants,
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            user: req.session.user,
            alerts: []
        });
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.render('home', {
            layout: 'index',
            title: 'TopNotch',
            restaurants: {},
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            user: req.session.user,
            alerts: [{ type: 'error', message: 'Failed to load restaurants' }]
        });
    }
};

// View all establishments
const getAllEstablishments = async (req, res) => {
    try {
        // Get all restaurants from database
        const allRestaurants = await db.getAllRestaurants();
        
        // Group restaurants by category for the template structure
        const restaurantsByCategory = groupRestaurantsByCategory(allRestaurants);
        
        // Render the restaurants template with categorized data
        res.render('restaurants', { 
            layout: 'index',
            title: 'All Restaurants',
            restaurants: restaurantsByCategory,
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching establishments:', error);
        res.render('restaurants', {
            layout: 'index',
            title: 'All Restaurants',
            restaurants: {},
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            user: req.session.user,
            alerts: [{ type: 'error', message: 'Failed to retrieve retaurants' }]
        });
    }
};

// View the current user's establishments
const getUserEstablishments = async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const userId = req.session.user._id;
        const userRestaurants = await db.getAllRestaurantsOfUser(userId);
        
        // Group user's restaurants by category for the template structure
        const userRestaurantsByCategory = groupRestaurantsByCategory(userRestaurants);
        
        res.render('restaurants', { 
            layout: 'index',
            title: 'My Establishments',
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            restaurants: userRestaurantsByCategory
        });
    } catch (error) {
        console.error('Error fetching user establishments:', error);
        res.render('restaurants', {
            layout: 'index',
            title: 'My Establishments',
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            restaurants: {},
            alerts: [{ type: 'error', message: 'Failed to retrieve your retaurants' }]
        });
    }
};

// Helper function to group restaurants by category
function groupRestaurantsByCategory(restaurants) {
    const restaurantsByCategory = {};
    
    if (!restaurants || restaurants.length === 0) {
        return restaurantsByCategory;
    }
    
    restaurants.forEach(restaurant => {
        // Use type from the restaurant data or fallback to 'Uncategorized'
        const category = restaurant.type || 'Uncategorized';
        
        if (!restaurantsByCategory[category]) {
            restaurantsByCategory[category] = [];
        }
        
        // Format restaurant data consistently
        restaurantsByCategory[category].push({
            id: restaurant._id,
            name: restaurant.name,
            type: restaurant.type,
            picture_address: restaurant.picture_address,
            rating: restaurant.rating || 0,
            address: restaurant.address || '',
            phone_number: restaurant.phone_number || '',
            min_price: restaurant.pricing_from || 0,
            max_price: restaurant.pricing_to || 0
        });
    });
    
    return restaurantsByCategory;
}

// Get restaurants data for API endpoints
const getRestaurantsData = async () => {
    try {
        // Get all restaurants from database
        const allRestaurants = await db.getAllRestaurants();
        
        // Group restaurants by category
        const restaurantsByCategory = groupRestaurantsByCategory(allRestaurants);
        
        return restaurantsByCategory;
    } catch (error) {
        console.error('Error fetching restaurant data:', error);
        return {};
    }
};

// Get a single establishment by ID
const getEstablishmentById = async (req, res) => {
    try {
        const establishmentId = req.params.id;
        const restaurants = await db.getRestaurantOfID(establishmentId);
        
        if (!restaurants || restaurants.length === 0) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Restaurant Not Found',
                alerts: [{ type: 'error', message: 'Restaurant Not Found' }]
            });
        }
        
        const establishment = restaurants[0]; // The function returns an array
        
        res.render('establishment', { 
            layout: 'index',
            title: establishment.name,
            establishment
        });
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: error.message,
            alerts: [{ type: 'error', message: 'Failed to load restaurant' }]
        });
    }
};

module.exports = {
    displayHome,
    getAllEstablishments,
    getUserEstablishments,
    getRestaurantsData,
    getEstablishmentById
};