const db = require('../model/model'); // Adjust path as needed

// View all establishments
const getAllEstablishments = async (req, res) => {
    try {
        // Get all restaurants from database
        const allRestaurants = await db.getAllRestaurants();
        
        // Group restaurants by category for the template structure
        const restaurantsByCategory = groupRestaurantsByCategory(allRestaurants);
        
        // Render the restaurants template with categorized data
        res.render('restaurant', { 
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
        
        res.render('restaurant', { 
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

// Helper function to group restaurants by category
function groupRestaurantsByCategory(restaurants) {
    const restaurantsByCategory = {};
    
    restaurants.forEach(restaurant => {
        const category = restaurant.type || 'Uncategorized';
        
        if (!restaurantsByCategory[category]) {
            restaurantsByCategory[category] = [];
        }
        
        restaurantsByCategory[category].push({
            id: restaurant._id,
            name: restaurant.name,
            type: restaurant.type,
            banner: restaurant.picture_address || '/common/default-restaurant.jpg',
            rating: restaurant.rating || 0
        });
    });
    
    return restaurantsByCategory;
}

module.exports = {
    getAllEstablishments,
    getUserEstablishments
};