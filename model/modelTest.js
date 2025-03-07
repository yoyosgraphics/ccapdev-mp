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
    //console.log("Restaurants with Filters: ", await model.getRestaurantWithFilters(undefined, undefined, undefined, 350, 600));
    //console.log("Reviews Of User: ", await model.getAllReviewsOfUser('67c9a5edd220f3bd703c75a1'));
    //console.log("Restaurants Of User: ", await model.getAllRestaurantsOfUser('67c9a5edd220f3bd703c75a1'));
    //console.log("Comments Of User: ", await model.getAllCommentsOfUser('67c9a5edd220f3bd703c75a1'));
    // console.log("Restaurants with Filters: ", await model.getRestaurantWithFilters(undefined, undefined, undefined, 350, 600));
    // console.log("Restaurant: ", await model.getRestaurantOfID("67c9ba5dd220f3bd703c75e2"));
    // await model.updateRestaurantOfID("67c9ba5dd220f3bd703c75e2", "Piccolino Restaurant", "Italian","One Archers Place, Castro Street, Taft Ave, Malate, Manila, 1004 Metro Manila", "09150579395", 200, 400, "");
     //console.log("Restaurant: ", await model.getRestaurantOfID("67c9ba5dd220f3bd703c75e2"));
    
    
    //console.log("User: ", await model.getUserID('67c9b74ad220f3bd703c75cc'));
    await model.updateUserID("67c9b74ad220f3bd703c75cc", "Ethan", "Burayag","EthanUser2", "gg123", "123");
    console.log("User: ", await model.getUserID('67c9b74ad220f3bd703c75cc'));
    mongoose.connection.close();
    process.exit();
}

test();

