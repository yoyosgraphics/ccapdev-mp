const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  address: { type: String, required: true },
  phone_number: { type: String, required: true },
  pricing_from: { type: Number, required: true },
  pricing_to: { type: Number, required: true },
  delete_status: { type: Boolean, required: true},
  picture_address: { type: String, required: true},
  rating: { type: Number, required: true},
  user_id: { type: ObjectId, ref: "User", required: true },
}, {collection: "restaurant-records"});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;