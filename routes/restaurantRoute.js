const express = require('express');
const router = express.Router();
const restaurantController = require('../controller/restaurantController');
const db = require('../model/model');

// Route to get all restaurants
router.get('/', restaurantController.getAllRestaurants);

// Route to get user's restaurants
router.get('/user', restaurantController.getUserRestaurants);

// Route to display the form for creating a new restaurant
router.get('/new', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('new-restaurant', { 
        layout: 'index',
        title: 'Add New Restaurant'
    });
});

// Route to get a single restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Route to handle the creation of a new restaurant
router.post('/', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const newRestaurantData = {
            ...req.body,
            user_id: req.session.user._id // Add the user ID to the data
        };
        
        await db.createRestaurant(newRestaurantData);
        res.redirect('/restaurants');
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: error.message,
            alerts: [{ type: 'error', message: 'Failed to create restaurant' }]
        });
    }
});

// Route to display the form for editing an existing restaurant
router.get('/edit/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const restaurantId = req.params.id;
        // Use the consistent function from server.js
        const restaurants = await db.getRestaurantOfID(restaurantId);
        
        if (!restaurants || restaurants.length === 0) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Restaurant Not Found',
                alerts: [{ type: 'error', message: 'Restaurant not found' }]
            });
        }
        
        const restaurant = restaurants[0]; // The function returns an array
        
        // Check if user is the owner of the restaurant
        if (restaurant.user_id && restaurant.user_id.toString() !== req.session.user._id.toString()) {
            return res.status(403).render('error', {
                layout: 'index',
                title: 'Unauthorized',
                error: 'You are not authorized to edit this restaurant',
                alerts: [{ type: 'error', message: 'Unauthorized access' }]
            });
        }
        
        res.render('edit-restaurant', { 
            layout: 'index',
            title: `Edit ${restaurant.name}`,
            restaurant
        });
    } catch (error) {
        console.error('Error fetching restaurant for edit:', error);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: error.message,
            alerts: [{ type: 'error', message: 'Failed to load restaurant' }]
        });
    }
});

// Route to handle the update of an existing restaurant
router.post('/edit/:id', async (req, res) => {
    try {        
        const restaurantId = req.params.id;
        const { name, type, address, phone_number, pricing_from, pricing_to, picture_address } = req.body;

        if (isNaN(pricing_from) || isNaN(pricing_to)) {
            return res.status(400).render('edit_restaurant', {
                selected: { ...req.body, _id: restaurantId },
                alerts: [{ type: 'error', message: 'Invalid price range. Please enter valid numbers.' }]
            });
        }

        const minPrice = parseFloat(pricing_from);
        const maxPrice = parseFloat(pricing_to);

        if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
            return res.status(400).render('edit_restaurant', {
                selected: { ...req.body, _id: restaurantId },
                alerts: [{ type: 'error', message: 'Invalid price range. Please enter valid numbers.' }]
            });
        }

        await db.updateRestaurantOfID(restaurantId, name, type, address, phone_number, pricing_from, pricing_to, picture_address);

        res.redirect(`/view/restaurant/${restaurantId}`);
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: error.message,
            alerts: [{ type: 'error', message: 'Failed to update restaurant' }]
        });
    }
});

// Route to delete an restaurant
router.post('/archive/:id', async (req, res) => {
    try {
        const restaurantId = req.params.id;
        console.log('Archiving restaurant with ID:', restaurantId);

        // Call the function to archive the restaurant in your controller
        await restaurantController.archiveRestaurant(req, res, restaurantId);
    } catch (error) {
        console.error('Error archiving restaurant:', error);
        return res.status(500).json({ success: false, message: 'Server error occurred' });
    }
});


module.exports = router;