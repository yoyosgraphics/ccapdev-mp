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

// Restaurant Reviews Page
const getRestaurantReviewsOfID = async (id) => {
    let reviews = await Review.find({restaurant_id: id}, {_id: 1, date: 1, title: 1, rating: 1, content: 1, picture_address: 1, likes: 1, dislikes: 1})
                        .populate("user_id", "first_name last_name picture_address")
                        .sort({likes: -1})
                        .lean();

    for (let review of reviews) {
        review.num_comments = await Comment.countDocuments({review_id: review._id});
    }

    return reviews;
}

const updateReviewLikesOfID = async (id, status) => {
    let update = 0;

    if (status == 1)
        update = 1;
    else if (status == -1)
        update = -1;
        
    let review = await Review.findByIdAndUpdate(
        id,
        {
            $inc: {likes: update}
        },
        {new: true}
    );

    return review;
}

const updateReviewDislikesOfID = async (id, status) => {
    let update = 0;

    if (status == 1)
        update = 1;
    else if (status == -1)
        update = -1;
        
    let review = await Review.findByIdAndUpdate(
        id,
        {
            $inc: {dislikes: update}
        },
        {new: true}
    );

    return review;
}

// Search Review Request
const searchReviews = async (id, _content) => {
    let search = {restaurant_id: id};

    if (_content) {
        search.$or = [
            {title: {$regex: _content, $options: "i"}},
            {content: {$regex: _content, $options: "i"}},

        ]
    }

    let reviews = await Review.find(search, {_id: 1, date: 1, title: 1, rating: 1, content: 1, picture_address: 1, likes: 1, dislikes: 1})
                                .populate("user_id", "first_name last_name picture_address")
                                .sort({likes: -1})
                                .lean();

    for (let review of reviews) {
        review.num_comments = await Comment.countDocuments({review_id: review._id});
    }

    return reviews;
}

// Individual Review Page Request
const getReviewOfID = async (id) => {
    let review = await Review.find({_id: id}, {_id: 1, date: 1, title: 1, rating: 1, content: 1, picture_address: 1, likes: 1, dislikes: 1, user_id: 1})
                                .populate("user_id", "first_name last_name picture_address")
                                .lean();
    
    review.num_comments = await Comment.countDocuments({review_id: review._id});

    return review;
}

const addComment = async (_user_id, _review_id, _content) => {
    const comment = Comment({
        user_id: _user_id,
        review_id: _review_id,
        content: _content,
        edit_status: false,
        delete_status: false
    })

    let res = await comment.save();
}

const compareID = (id1, id2) => {
    return new mongoose.Types.ObjectId(id1).equals(id2);
}

const getReviewCommentsOfID = async (id) => {
    let comments = await Comment.find({review_id: id}, {_id: 1, user_id: 1, content: 1})
                        .populate("user_id", "first_name last_name")
                        .lean();

    let owner_restaurant = await Review.findOne({_id: id}, {restaurant_id: 1})
                                        .lean()
                        
    for (let comment of comments) {
        let user_restaurant = await Restaurant.findOne({user_id: comment.user_id._id}, {_id: 1})
                                            .lean();

        if (user_restaurant) {
            if (compareID(user_restaurant._id, owner_restaurant.restaurant_id)) {
                comment.owner = true;
            }
            else {
                comment.owner = false;
            }
        }
        else {
            comment.owner = false;
        }
    }

    return comments;
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

// Core
const getRestaurantOfID = async (id) => {
    return await Restaurant.find({_id: id}, {_id: 1, name: 1, type: 1, address: 1, phone_number: 1, pricing_from: 1, pricing_to: 1, picture_address: 1, rating: 1, user_id: 1})
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
    updateReviewDislikesOfID,
    updateReviewLikesOfID,
    getRestaurantReviewsOfID,
    searchReviews,
    getUserID,
    updateUserID,
    getReviewOfID,
    addComment,
    getReviewCommentsOfID,
};