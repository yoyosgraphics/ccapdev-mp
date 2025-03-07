const mongoose = require('mongoose');
const model = require("./model");

mongoose.connect('mongodb://localhost:27017/restaurant-review-db');

const test = async () => {
    console.log("Users:", await model.getAllUsers());
    console.log("Restaurants:", await model.getAllRestaurants());
    console.log("Reviews:", await model.getAllReviews());
    console.log("Comments:", await model.getAllComments());

    mongoose.connection.close();
    process.exit();
}

test();

