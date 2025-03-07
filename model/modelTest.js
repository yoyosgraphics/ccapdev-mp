const mongoose = require('mongoose');
const model = require("./model");

mongoose.connect('mongodb://localhost:27017/restaurant-review-db');

const test = async () => {
    // console.log("Users:", await model.getAllUsers());
    // console.log("Restaurants:", await model.getAllRestaurants());
    // console.log("Reviews:", await model.getAllReviews());
    // console.log("Comments:", await model.getAllComments());
    // console.log("Restaurant of User 1: ", await model.getAllRestaurantsOfUser("67c9a5edd220f3bd703c75a1"));
    // console.log("Top 3 Restaurants: ", await model.getTopNumRestaurants(3));
    // console.log("Italian Restaurant: ", await model.getRestaurantOfType("Italian"));

    mongoose.connection.close();
    process.exit();
}

test();

