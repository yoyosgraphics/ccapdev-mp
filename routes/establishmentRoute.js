const express = require('express');
const router = express.Router();
const establishmentController = require('../controller/establishmentController');
const db = require('../model/model');

// Route to get all establishments
router.get('/', establishmentController.getAllEstablishments);

// Route to get user's establishments
router.get('/user', establishmentController.getUserEstablishments);

// Route to display the form for creating a new establishment
router.get('/new', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('new-establishment', { 
        layout: 'index',
        title: 'Add New Establishment'
    });
});

// Route to get a single establishment by ID
router.get('/:id', establishmentController.getEstablishmentById);

// Route to handle the creation of a new establishment
router.post('/', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const newEstablishmentData = {
            ...req.body,
            user_id: req.session.user._id // Add the user ID to the data
        };
        
        await db.createRestaurant(newEstablishmentData);
        res.redirect('/restaurants');
    } catch (error) {
        console.error('Error creating establishment:', error);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: error.message,
            alerts: [{ type: 'error', message: 'Failed to create establishment' }]
        });
    }
});

// Route to display the form for editing an existing establishment
router.get('/edit/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const establishmentId = req.params.id;
        // Use the consistent function from server.js
        const restaurants = await db.getRestaurantOfID(establishmentId);
        
        if (!restaurants || restaurants.length === 0) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Establishment Not Found',
                alerts: [{ type: 'error', message: 'Establishment not found' }]
            });
        }
        
        const establishment = restaurants[0]; // The function returns an array
        
        // Check if user is the owner of the establishment
        if (establishment.user_id && establishment.user_id.toString() !== req.session.user._id.toString()) {
            return res.status(403).render('error', {
                layout: 'index',
                title: 'Unauthorized',
                error: 'You are not authorized to edit this establishment',
                alerts: [{ type: 'error', message: 'Unauthorized access' }]
            });
        }
        
        res.render('edit-establishment', { 
            layout: 'index',
            title: `Edit ${establishment.name}`,
            establishment
        });
    } catch (error) {
        console.error('Error fetching establishment for edit:', error);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: error.message,
            alerts: [{ type: 'error', message: 'Failed to load establishment' }]
        });
    }
});

// Route to handle the update of an existing establishment
router.post('/edit/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const establishmentId = req.params.id;
        // Get the restaurant first to check authorization
        const restaurants = await db.getRestaurantOfID(establishmentId);
        
        if (!restaurants || restaurants.length === 0) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Establishment Not Found',
                alerts: [{ type: 'error', message: 'Establishment not found' }]
            });
        }
        
        const establishment = restaurants[0];
        
        // Check if user is the owner of the establishment
        if (establishment.user_id && establishment.user_id.toString() !== req.session.user._id.toString()) {
            return res.status(403).render('error', {
                layout: 'index',
                title: 'Unauthorized',
                error: 'You are not authorized to edit this establishment',
                alerts: [{ type: 'error', message: 'Unauthorized access' }]
            });
        }
        
        const updatedData = req.body;
        await db.updateRestaurant(establishmentId, updatedData);
        // Fix the redirect URL to use the proper route
        res.redirect(`/restaurant/${establishmentId}`);
    } catch (error) {
        console.error('Error updating establishment:', error);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: error.message,
            alerts: [{ type: 'error', message: 'Failed to update establishment' }]
        });
    }
});

// Route to delete an establishment
router.post('/delete/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const establishmentId = req.params.id;
        // Get the restaurant first to check authorization
        const restaurants = await db.getRestaurantOfID(establishmentId);
        
        if (!restaurants || restaurants.length === 0) {
            return res.status(404).render('404', {
                layout: 'index',
                title: 'Establishment Not Found',
                alerts: [{ type: 'error', message: 'Establishment not found' }]
            });
        }
        
        const establishment = restaurants[0];
        
        // Check if user is the owner of the establishment
        if (establishment.user_id && establishment.user_id.toString() !== req.session.user._id.toString()) {
            return res.status(403).render('error', {
                layout: 'index',
                title: 'Unauthorized',
                error: 'You are not authorized to delete this establishment',
                alerts: [{ type: 'error', message: 'Unauthorized access' }]
            });
        }
        
        await db.deleteRestaurant(establishmentId);
        res.redirect('/restaurants');
    } catch (error) {
        console.error('Error deleting establishment:', error);
        res.status(500).render('error', {
            layout: 'index',
            title: 'Error',
            error: error.message,
            alerts: [{ type: 'error', message: 'Failed to delete establishment' }]
        });
    }
});

module.exports = router;