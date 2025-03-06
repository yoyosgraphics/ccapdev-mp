const Review = require('../models/Review');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

exports.addReview = async (req, res) => {
  try {
    const { userId, restaurantId, rating, comment } = req.body;

    // Create the review
    const newReview = new Review({ user: userId, restaurant: restaurantId, rating, comment });
    await newReview.save();

    // Add review reference to User and Restaurant
    await User.findByIdAndUpdate(userId, { $push: { reviews: newReview._id } });
    await Restaurant.findByIdAndUpdate(restaurantId, { $push: { reviews: newReview._id } });

    res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
