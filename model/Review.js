const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema({
  user_id: { type: ObjectId, ref: "User", required: true},
  restaurant_id: { type: ObjectId, ref: "Restaurant", required: true},
  date: { type: String, required: true },
  title: { type: String, required: true },
  rating: { type: Number, required: true },
  content: { type: String, required: true },
  picture_address: { type: [String], required: false },
  likes: { type: [ObjectId], ref: "User", default: [] },
  dislikes: { type: [ObjectId], ref: "User", default: [] },
  edit_status: { type: Boolean, required: true },
  delete_status: { type: Boolean, required: true },
}, 
  { 
    collection: "review-records", 
    versionKey: false
  });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;