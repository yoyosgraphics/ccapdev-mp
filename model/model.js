// const mongoose = require("mongoose");
// const User = require("./User"); // Ensure correct path
// const Restaurant = require("./Restaurant");
// const Rating = require("./Review");
// const Comment = require("./Comment");

// const connectDB = async () => {
//     try {
//         await mongoose.connect("mongodb://localhost:27017/restaurant-review-db");
//         console.log("MongoDB connected successfully");

//         // Retrieve all users
//         const users = await User.find({});
//         const restaurant = await Restaurant.find({});
//         const ratings = await Rating.find({});
//         const comment = await Comment.find({});
//         //console.log("Retrieved Users:", users);
//         //console.log("Retrieved Restaurants:", restaurant);
//         //console.log("Retrieved Ratings: ", ratings);
//         console.log("Retrieved Comments: ", comment);
//     } catch (error) {
//         console.error("MongoDB connection error:", error);
//         process.exit(1);
//     }
// };

// connectDB();
