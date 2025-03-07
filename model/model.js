const mongoose = require('mongoose');

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

// Search Restaurant Page Request
const getRestaurantWithFilters = async (_name, _type, _rating, _pricing_from, _pricing_to) => {
    let filters = {};

    if (_name) {
        filters.name = {$regex: _name, $options: "i"};
    }

    if (_type) {
        filters.type = _type;
    }

    if (_rating) {
        filters.rating = {$gte: _rating};
    }

    if (_pricing_from) {
        filters.pricing_from = {$gte: _pricing_from};
    }

    if (_pricing_to) {
        filters.pricing_to = {$lte: _pricing_to};
    }

    return await Restaurant.find(filters, {_id: 1, name: 1, type: 1, rating: 1, address: 1, phone_number: 1, pricing_from: 1, pricing_to: 1, picture_address: 1})
                            .lean();
}

// Edit Restaurant Page Request
const getRestaurantOfID = async (id) => {
    return await Restaurant.find({_id: id}, {_id: 1, name: 1, type: 1, address: 1, phone_number: 1, pricing_from: 1, pricing_to: 1, picture_address: 1})
                            .lean();
}

const getRestaurantOfName = async (_name) => {
    return await Restaurant.find({name: _name})
                            .lean();
}

const updateRestaurantOfID = async (id, _name, _type, _address, _phone_number, _pricing_from, _pricing_to, _picture_address) => {
    let restaurant = await Restaurant.findByIdAndUpdate(
        id,
        {
            name: _name,
            type: _type,
            address: _address,
            phone_number: _phone_number,
            pricing_from: _pricing_from,
            pricing_to: _pricing_to,
            picture_address: _picture_address
        },
        {new: true}
    );

    return restaurant;
}

// Edit Profile Page Request
const getUserID = async (id) => {
    return await User.find({_id: id}, {_id: 1, email_address: 1, first_name: 1, last_name: 1, username: 1, password: 1, picture_address: 1, biography: 1})
                            .lean();
}

const updateUserID = async (id, first_name, last_name, username, biography, picture_address) => {
    return await User.findByIdAndUpdate(
        id,
        { first_name: first_name, 
            last_name: last_name, 
            username: username, 
            biography: biography, 
            picture_address: picture_address },
        { new: true }
    ).lean();
};


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

const toObjectId = (id) => {
    return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
};

const getAllRestaurantsOfUser = async (userID) => {
    const objectId = toObjectId(userID);
    return await Restaurant.find({user_id: objectId})
                            .lean();
}

const getAllReviewsOfUser = async (userID) => {
    const objectId = toObjectId(userID);
    return await Review.find({user_id: objectId})
                            .lean();
}

const getAllCommentsOfUser = async (userID) => {
    const objectId = toObjectId(userID);
    return await Comment.find({user_id: objectId})
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
    getRestaurantWithFilters,
    getAllReviewsOfUser,
    getAllCommentsOfUser,
    getRestaurantOfID,
    getRestaurantOfName,
    updateRestaurantOfID,
    getUserID,
    updateUserID,
};