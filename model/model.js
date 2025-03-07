const User = require("./User");
const Restaurant = require("./Restaurant");
const Review = require("./Review");
const Comment = require("./Comment");

const getAllUsers = async () => {
    return await User.find({}).lean();
}

const getAllRestaurants = async () => {
    return await Restaurant.find({}).lean();
}

const getAllReviews = async () => {
    return await Review.find({}).lean();
}

const getAllComments = async () => {
    return await Comment.find({}).lean();
}

module.exports = {
    getAllUsers,
    getAllRestaurants,
    getAllReviews,
    getAllComments,
};