const db = require('../model/model'); // Adjust path as needed

// View all establishments
const getAllEstablishments = async (req, res) => {
    try {
        // Get all restaurants from database
        const allRestaurants = await db.getAllRestaurants();
        
        // Group restaurants by category for the template structure
        const restaurantsByCategory = groupRestaurantsByCategory(allRestaurants);
        
        // Render the restaurants template with categorized data
        res.render('restaurants', { 
            title: 'All Establishments',
            restaurants: restaurantsByCategory,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Error fetching establishments:', error);
        // Assuming alert is a global function or provided by middleware
        alert('error', 'Failed to retrieve establishments');
        res.redirect('/');
    }
};

// View the previous user's establishments
const getUserEstablishments = async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            alert('error', 'You must be logged in to view your establishments');
            return res.redirect('/login');
        }
        
        const userId = req.session.user._id;
        const userRestaurants = await db.getAllRestaurantsOfUser(userId);
        
        // Group user's restaurants by category for the template structure
        const userRestaurantsByCategory = groupRestaurantsByCategory(userRestaurants);
        
        res.render('restaurants', { 
            title: 'My Establishments',
            restaurants: userRestaurantsByCategory,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching user establishments:', error);
        alert('error', 'Failed to retrieve your establishments');
        res.redirect('/');
    }
};

// Helper function to group restaurants by category - UPDATED to match restaurants.json format
function groupRestaurantsByCategory(restaurants) {
    const restaurantsByCategory = {};
    
    restaurants.forEach(restaurant => {
        // Use type from the restaurant data or fallback to 'Uncategorized'
        const category = restaurant.type || 'Uncategorized';
        
        if (!restaurantsByCategory[category]) {
            restaurantsByCategory[category] = [];
        }
        
        // Use the structure format from restaurants.json
        restaurantsByCategory[category].push({
            id: restaurant.id || restaurant._id, // Support both id formats
            name: restaurant.name,
            type: restaurant.type,
            banner: restaurant.banner || restaurant.picture_address || '/common/default-restaurant.jpg',
            rating: restaurant.rating || 0,
            // Adding additional fields that might be needed
            address: restaurant.address,
            phone_number: restaurant.phone_number,
            min_price: restaurant.min_price || restaurant.pricing_from,
            max_price: restaurant.max_price || restaurant.pricing_to
        });
    });
    
    return restaurantsByCategory;
}

// Function that returns restaurant data without rendering a view
const getRestaurantsData = async () => {
    try {
        // Get all restaurants from database
        const allRestaurants = await db.getAllRestaurants();
        
        // Group restaurants by category
        const restaurantsByCategory = groupRestaurantsByCategory(allRestaurants);
        
        return restaurantsByCategory;
    } catch (error) {
        console.error('Error fetching establishments:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

// Don't forget to add this to your module.exports
module.exports = {
    getAllEstablishments,
    getUserEstablishments,
    getRestaurantsData
};