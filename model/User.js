const mongoose = require("mongoose"); 

const userSchema = new mongoose.Schema({
    email_address: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    picture_address: { type: String, required: true },
    biography: { type: String, required: false },
}, { collection: "user-records" }); 

const User = mongoose.model("User", userSchema);
module.exports = User;
