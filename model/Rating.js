const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  restaurant_id: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  rating: { type: String, required: true },
  content: { type: String, required: true },
  picture_address: { type: [String], required: false },
  likes: { type: Number, required: true },
  dislikes: { type: Number, required: true },
  edit_status: { type: Boolean, required: true },
  delete_status: { type: Boolean, required: true },
}, { collection: "rating-records" });

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;