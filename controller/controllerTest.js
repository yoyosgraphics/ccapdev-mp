import mongoose from 'mongoose';
import model from '../model/model.js'; // Ensure model.js correctly establishes a connection

// Importing Restaurant model dynamically for ES Module compatibility
import('file:///' + import.meta.dirname + '/../model/Restaurant.js')
    .then(({ default: RestaurantModel }) => {
        const { getAllRestaurants } = RestaurantModel;

        console.log("Mongoose Connection State BEFORE:", mongoose.connection.readyState);

        mongoose.connect('mongodb://localhost:27017/restaurant-review-db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log("✅ MongoDB Connected! Mongoose Connection State:", mongoose.connection.readyState);

            return model.getAllRestaurants();
        }).then(restaurants => {
            console.log("✅ Restaurants fetched:", restaurants);
        }).catch(error => {
            console.error("❌ Error fetching restaurants:", error);
        }).finally(() => {
            mongoose.connection.close();
        });
    })
    .catch(error => {
        console.error("❌ Error loading RestaurantModel:", error);
    });
