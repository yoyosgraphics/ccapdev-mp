const User = require("./User");
const Restaurant = require("./Restaurant");
const Review = require("./Review");
const Comment = require("./Comment");

// Home Page Request
const getTopNumRestaurants = async (num) => {
    return await Restaurant.find({}, {_id: 1, name: 1, type: 1, rating: 1, picture_address: 1})
                            .sort({rating: -1})
                            .limit(num)
                            .lean();
}

// Restaurant Page Request 
const getRestaurantOfType = async (_type) => {
    return await Restaurant.find({type: _type}, {_id: 1, name: 1, rating: 1, picture_address: 1})
                            .sort({rating: -1})
                            .lean();
}

// Getters
const getAllUsers = async () => {
    return await User.find({})
                        .lean();
}

const getAllRestaurants = async () => {
    return await Restaurant.find({})
                            .lean();
}

const getAllReviews = async () => {
    return await Review.find({})
                        .lean();
}

const getAllComments = async () => {
    return await Comment.find({})
                        .lean();
}

const getAllRestaurantsOfUser = async (userID) => {
    return await Restaurant.find({user_id: userID})
                            .lean();
}

module.exports = {
    getAllUsers,
    getAllRestaurants,
    getAllReviews,
    getAllComments,
    getAllRestaurantsOfUser,
    getTopNumRestaurants,
    getRestaurantOfType,
};