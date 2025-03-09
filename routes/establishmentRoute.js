// const express = require('express');
// const router = express.Router();
// const establishmentController = require('../controller/establishmentController');

// // Route to get all establishments
// router.get('/', establishmentController.getAllEstablishments);

// // Route to get user's establishments
// router.get('/user', establishmentController.getUserEstablishments);

// module.exports = router;



const express = require('express');
const router = express.Router();
const establishmentController = require('../controller/establishmentController');

// Route to get all establishments
router.get('/', establishmentController.getAllEstablishments);

// Route to get user's establishments
router.get('/user', establishmentController.getUserEstablishments);

// Route to get a single establishment by ID
router.get('/:id', async (req, res) => {
    try {
        const establishmentId = req.params.id;
        const establishment = await db.getRestaurantById(establishmentId); // Fetch establishment by ID
        if (!establishment) {
            return res.status(404).send('Establishment not found');
        }
        res.render('establishment', { 
            title: establishment.name,
            establishment,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Error fetching establishment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display the form for creating a new establishment
router.get('/new', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('new-establishment', { title: 'Add New Establishment', user: req.session.user });
});

// Route to handle the creation of a new establishment
router.post('/', async (req, res) => {
    try {
        const newEstablishmentData = req.body; // Get data from the request body
        await db.createRestaurant(newEstablishmentData); // Create new establishment in the database
        res.redirect('/'); // Redirect to the list of establishments
    } catch (error) {
        console.error('Error creating establishment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display the form for editing an existing establishment
router.get('/edit/:id', async (req, res) => {
    try {
        const establishmentId = req.params.id;
        const establishment = await db.getRestaurantById(establishmentId);
        if (!establishment) {
            return res.status(404).send('Establishment not found');
        }
        res.render('edit-establishment', { 
            title: `Edit ${establishment.name}`,
            establishment,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Error fetching establishment for edit:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle the update of an existing establishment
router.post('/edit/:id', async (req, res) => {
    try {
        const establishmentId = req.params.id;
        const updatedData = req.body; // Get updated data from the request body
        await db.updateRestaurant(establishmentId, updatedData); // Update establishment in the database
        res.redirect('/'); // Redirect to the list of establishments
    } catch (error) {
        console.error('Error updating establishment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to delete an establishment
router.post('/delete/:id', async (req, res) => {
    try {
        const establishmentId = req.params.id;
        await db.deleteRestaurant(establishmentId); // Delete establishment from the database
        res.redirect('/'); // Redirect to the list of establishments
    } catch (error) {
        console.error('Error deleting establishment:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

