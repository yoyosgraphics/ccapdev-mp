const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  id: { type: String, required: true },
  rating: { type: String, required: true },
  banner: { type: String, required: true },
  address: { type: String, required: true },
  phone_number: { type: String, required: true },
  min_price: { type: Number, required: true },
  max_price: { type: Number, required: true },
}, {collection: "restaurant-records"});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;