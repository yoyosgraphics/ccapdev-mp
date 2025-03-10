// npm i mongoose bcrypt

const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const User = require("./User");
const Restaurant = require("./Restaurant");
const Review = require("./Review");
const Comment = require("./Comment");

// Home Page Request
// Gets the top N restaurants based on ratings with the necessary data to be displayed in the home page.
const getTopNumRestaurants = async (num) => {
    return await Restaurant.find({}, {_id: 1, name: 1, type: 1, rating: 1, picture_address: 1})
                            .sort({rating: -1})
                            .limit(num)
                            .lean();
}

// Restaurant Page Request 
// Gets a list of restaurants based on the given type with the necessary data to be displayed in each corresponding type in the restaurants page.
// Example types: "American", "Italian"
const getRestaurantOfType = async (_type) => {
    return await Restaurant.find({type: _type}, {_id: 1, name: 1, rating: 1, picture_address: 1})
                            .sort({rating: -1})
                            .lean();
}

// Search Restaurant Page Request
// Searches and filters out restaurants based on the given filter data.
// When filter category is not selected, it should be undefined.
const getRestaurantWithFilters = async (_name, _type, _rating, _pricing_from, _pricing_to) => {
    let filters = {};

    if (_name) {
        filters.$or = [
            {name: {$regex: _name, $options: "i"}},
            {address: {$regex: _name, $options: "i"}},
        ];
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
// Gets restaurant data based on the given restaurant name.
const getRestaurantOfName = async (_name) => {
    return await Restaurant.find({name: _name})
                            .lean();
}

// Checks whether the given restaurant name already exists in the database. 
// To ensure that whenever editing or creating,  restaurant name is still unique.
const verifyRestaurantName = async (_name) => {
    const exists = await Restaurant.exists({name: _name});
    return !exists;
};

// Updates restaurant info based on the given data.
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

// Create Restaurant Page Request
// Create new restaurant record based on the given data.
const addRestaurant = async (_name, _type, _address, _phone_number, _pricing_from, _pricing_to, picture_file, _user_id) => {
    const restaurant = Restaurant({
        name: _name,
        type: _type,
        address: _address,
        phone_number: _phone_number,
        pricing_from: _pricing_from,
        pricing_to: _pricing_to,
        delete_status: false,
        picture_address: "",
        rating: 0,
        user_id: _user_id
    })

    await restaurant.save();

    const restaurantID = restaurant._id;

    let _picture_address;

    if (picture_file){
        _picture_address = await saveRestaurantImage(picture_file, restaurantID);
    } else {
        _picture_address = "/uploads/restaurant-common.png"
    }

    await Restaurant.findByIdAndUpdate(restaurantID, {picture_address: _picture_address}, {new: true});

}

// Save Restaurant Image
const saveRestaurantImage = async (file, _restaurant_id) => {
    if (!file) 
        return null;

    const dir = "/uploads/";

    const fileName = "restaurant-" + _restaurant_id + path.extname(file.originalname);
    const filePath = path.join(dir, fileName);

    fs.renameSync(file.path, filePath);

    return "/uploads/" + fileName;
}

// Restaurant Reviews Page
// Gets the restaurant data based on the given restaurant id to be displayed by concerned pages, such as restaurant reviews page.
const getRestaurantOfID = async (id) => {
    return await Restaurant.find({_id: id}, {_id: 1, name: 1, type: 1, address: 1, phone_number: 1, pricing_from: 1, pricing_to: 1, picture_address: 1, rating: 1, user_id: 1})
                            .lean();
}

// Gets the reviews of the concerned restaurant based on the given restaurant id with the necessary data to be displayed in the restaurant reviews page.
// Comments themselves under the reviews are not displayed when not under individual review page.
const getRestaurantReviewsOfID = async (id) => {
    let reviews = await Review.find({restaurant_id: id}, {_id: 1, date: 1, title: 1, rating: 1, content: 1, picture_addresses: 1, likes: 1, dislikes: 1})
                        .populate("user_id", "_id first_name last_name picture_address")
                        .sort({likes: -1})
                        .lean();

    for (let review of reviews) {
        review.num_comments = await Comment.countDocuments({review_id: review._id});

        if (review.picture_addresses.length == 0) {
            review.has_images = false;
        } else {
            review.has_images = true;
        }
    }

    return reviews;
}

// Updates the number of likes of the concerned review based on the given review id and status: 1: +1 like, -1: -1 like, whenever clicked.
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

// Updates the number of dislikes of the concerned review based on the given review id and status: 1: +1 dislike, -1: -1 dislike, whenever clicked.
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
// Searches and filters out reviews based on the given filter data.
const searchReviews = async (id, _content) => {
    let search = {restaurant_id: id};

    if (_content) {
        search.$or = [
            {title: {$regex: _content, $options: "i"}},
            {content: {$regex: _content, $options: "i"}},

        ]
    }

    let reviews = await Review.find(search, {_id: 1, date: 1, title: 1, rating: 1, content: 1, picture_addresses: 1, likes: 1, dislikes: 1})
                                .populate("user_id", "first_name last_name picture_address")
                                .sort({likes: -1})
                                .lean();

    for (let review of reviews) {
        review.num_comments = await Comment.countDocuments({review_id: review._id});
    }

    return reviews;
}

// Individual Review Page Request
// Gets review data based on the given review id with the necessary data to be displayed in the individual review page.
const getReviewOfID = async (id) => {
    let review = await Review.find({_id: id}, {_id: 1, date: 1, title: 1, rating: 1, content: 1, picture_addresses: 1, likes: 1, dislikes: 1, user_id: 1})
                                .populate("user_id", "first_name last_name picture_address")
                                .lean();
    
    review.num_comments = await Comment.countDocuments({review_id: review._id});

    return review;
}

// Creates new comment record based on the given data.
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

// Gets the list of comments under the concerned review based on the given review id.
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
                comment.owner = true; // Owner indication
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

// Edits comment data based on the given data.
const editCommentOfID = async (id, _content) => {
    let comment = await Comment.findByIdAndUpdate(
        id,
        {
           content: _content 
        },
        {new: true}
    );

    return comment;
}

// Write Review Page Request
// Creates new review record based on the given data.
const addReview = async (_user_id, _restaurant_id, _title, _rating, _content, picture_files) => {
    const review = Review({
        user_id: _user_id,
        restaurant_id: _restaurant_id,
        date: new Date().toISOString().split("T")[0],
        title: _title,
        rating: _rating,
        content: _content,
        picture_addresses: [],
        likes: 0,
        dislikes: 0,
        edit_status: false,
        delete_status: false
    })
    
    await review.save();

    const reviewID = review._id;

    let _picture_addresses = [];

    if (picture_files) {
        let num = 0;
        for (let picture of picture_files) {
            let _picture_address = await saveReviewImage(picture, reviewID, num);
            _picture_addresses.push(_picture_address);
            num++;
        }       
        await Review.findByIdAndUpdate(reviewID, {$push: {picture_addresses: {$each: _picture_addresses}}}, { new: true });
    }

    await updateRestaurantRatingOfID(_restaurant_id);
}

const saveReviewImage = async (file, _review_id, num) => {
    if (!file) 
        return null;

    const dir = "/uploads/";

    const fileName = "review-" + num + "-" + _review_id + path.extname(file.originalname);
    const filePath = path.join(dir, fileName);

    fs.renameSync(file.path, filePath);

    return "/uploads/" + fileName;
}

// Edit Review Page Request
// Updates review data based on the given info.
const editReviewOfID = async (id, _title, _rating, _content, _picture_addresses) => {
    let review = await Review.findByIdAndUpdate(
        id,
        {
            title: _title,
            rating: _rating,
            content: _content,
            picture_addresses: _picture_addresses,
            edit_status: true, // Edit indication
        },
        {new: true}
    );

    let restaurant = await Review.findOne({_id: id})
                                .populate("restaurant_id", "_id")
                                .lean();

    await updateRestaurantRatingOfID(restaurant.restaurant_id._id);

    return review;
}

// Update Rating Request
// Updates rating of the restaurant based on the given restaurant id whenever a review has been created or edited.
const updateRestaurantRatingOfID = async (_restaurant_id) => {
    const reviews = await Review.find({restaurant_id: _restaurant_id}, {rating: 1})
                                .lean();
    
    if (reviews.length === 0) {
        await Restaurant.findByIdAndUpdate(_restaurant_id, {rating: 0}, {new: true});
    } else {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = parseFloat((totalRating / reviews.length).toFixed(2));

        await Restaurant.findByIdAndUpdate(_restaurant_id, {rating: averageRating}, {new: true});
    }
}

// Register User Page Request
// Verifies the user registration status and creates the user data with the necessary information if successful.
const createUser = async(email_address, first_name, last_name, username, password, confirm_password, picture_file, biography) => {
    try {
        if (password !== confirm_password) {
            return { message: "Passwords do not match" };
        }

        const existingUser = await User.findOne({ 
            $or: [{ email_address }, { username }] 
        });

        if (existingUser) {
            return { message: "Email or username already taken" };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email_address,
            first_name,
            last_name,
            username,
            password: hashedPassword,
            picture_address: "/uploads/user-common.png",
            biography
        });

        await newUser.save(); 

        const newUserID = newUser._id;

        let _picture_address;

        if (picture_file){
            _picture_address = await saveUserImage(picture_file, newUserID);
        } else {
            _picture_address = "/uploads/user-common.png"
        }

        await User.findByIdAndUpdate(newUserID, {picture_address: _picture_address}, {new: true});

        return { message: "User created successfully" };

    } catch (error) {
        return { message: error.message };
    }
}

// Save User Image
const saveUserImage = async (file, _user_id) => {
    if (!file) 
        return null;

    const dir = "/uploads/";

    const fileName = "user-" + _user_id + path.extname(file.originalname);
    const filePath = path.join(dir, fileName);

    fs.renameSync(file.path, filePath);

    return "/uploads/" + fileName;
}

// Login User Page Request
// Verifies the user login status and returns the entire user data if successful.
const logInUser = async(email_address, password) => {
    try {
        const existingUser = await User.findOne({ email_address });

        if (!existingUser) {
            return { message: "User does not exist" };
        }

        const isMatch = password == existingUser.password;

        if (!isMatch) {
            return { message: "Incorrect password" };
        }

        return { message: "Login successful", user: existingUser };

    } catch (error) {
        return { message: error.message };
    }
}

// View Profile Page Request

// Also Edit Profile Page Request
// Gets the user data based on the given user id to be displayed by concerned pages, such as view profile and edit profile pages.
const getUserID = async (id) => {
    return await User.find({_id: id}, {_id: 1, email_address: 1, first_name: 1, last_name: 1, username: 1, password: 1, picture_address: 1, biography: 1})
                            .lean();
}

// Compares the given two ids.
const compareID = (id1, id2) => {
    return new mongoose.Types.ObjectId(id1).equals(id2);
}

// Checks whether the user is the owner of the profile visited.
// Determines whether the edit profile feature should be accessible.
const checkUserProfileOwner = async (_user_id, _profile_user_id) => {
    if (compareID(_profile_user_id, _user_id)) {
        return true;
    } else {
        return false;
    }
}

// Converts ID to ObjectID
const toObjectId = (id) => {
    return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
};

// Gets all restaurants of user based on the given user id with the necessary data to be displayed in the profile restaurants page.
const getAllRestaurantsOfUser = async (userID) => {
    const objectId = toObjectId(userID);
    return await Restaurant.find({user_id: objectId})
                            .lean();
}

// Checks whether the user is the owner of the restaurant.
// Determines whether the edit and delete feature should be accessible.
// Also used in other pages.
const checkUserRestaurantOwner = async (_user_id, _restaurant_id) => {
    let owner_restaurant = await Restaurant.findOne({_id: _restaurant_id}, {user_id: 1})
                                            .lean();

    if (compareID(owner_restaurant.user_id, _user_id)) {
        return true;
    } else {
        return false;
    }
}

// Gets all reviews of user based on the given user id with the necessary data to be displayed in the profile reviews page.
// Comments are also not included here.
const getAllReviewsOfUser = async (userID) => {
    const objectId = toObjectId(userID);

    let reviews = await Review.find({user_id: objectId}, {_id: 1, date: 1, title: 1, rating: 1, content: 1, picture_addresses: 1, likes: 1, dislikes: 1})
                                .populate("user_id", "first_name last_name picture_address")
                                .populate("restaurant_id", "_id name")
                                .lean();
    
    for (let review of reviews) {
        review.num_comments = await Comment.countDocuments({review_id: review._id});
    }
    
    return reviews;
}

// Checks whether the user is the owner of the review.
// Determines whether the edit and delete feature should be accessible.
// Also used in other pages.
const checkUserReviewOwner = async (_user_id, _review_id) => {
    let owner_review = await Review.findOne({_id: _review_id}, {user_id: 1})
                                            .lean();

    if (compareID(owner_review.user_id, _user_id)) {
        return true;
    } else {
        return false;
    }
}

// Gets all comments of user based on the given user id with the necessary data to be displayed in the profile comments page.
const getAllCommentsOfUser = async (userID) => {
    const objectId = toObjectId(userID);

    let comments = await Comment.find({user_id: objectId}, {_id: 1, content: 1})
                                .populate("review_id", "_id title")
                                .lean();

    return comments;
}

// Checks whether the user is the owner of the comment.
// Determines whether the edit and delete feature should be accessible.
// Also used in other pages.
const checkUserCommentOwner = async (_user_id, _comment_id) => {
    let owner_comment = await Comment.findOne({_id: _comment_id}, {user_id: 1})
                                            .lean();

    if (compareID(owner_comment.user_id, _user_id)) {
        return true;
    } else {
        return false;
    }
}

// Gets comment content based on the given comment id.
const getCommentOfID = async (id) => {
    return await Comment.findOne({_id: id}, {_id: 1, content: 1})
                        .lean()
}

// Edit Profile Page Request
// Updates user info based on the given data.
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

// Checks whether the given username already exists in the database. 
// To ensure that whenever editing, username is still unique.
const verifyUsername = async (_username) => {
    const exists = await User.exists({username: _username});
    return !exists;
};

// Getters
// Returns all users in database.
const getAllUsers = async () => {
    return await User.find({})
                        .lean();
}

// Returns all restaurants in database.
const getAllRestaurants = async () => {
    return await Restaurant.find({})
                            .lean();
}

// Returns all reviews in database.
const getAllReviews = async () => {
    return await Review.find({})
                        .lean();
}

// Returns all comments in database.
const getAllComments = async () => {
    return await Comment.find({})
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
    getCommentOfID,
    editCommentOfID,
    addReview,
    editReviewOfID,
    createUser,
    logInUser,
    checkUserRestaurantOwner,
    addRestaurant,
    checkUserReviewOwner,
    checkUserCommentOwner,
    checkUserProfileOwner,
    verifyUsername,
    verifyRestaurantName,
};