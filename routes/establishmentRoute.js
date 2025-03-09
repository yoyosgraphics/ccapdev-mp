const express = require('express');
const router = express.Router();
const establishmentController = require('../controller/establishmentController');

// Route to get all establishments
router.get('/', establishmentController.getAllEstablishments);

// Route to get user's establishments
router.get('/user', establishmentController.getUserEstablishments);

module.exports = router;