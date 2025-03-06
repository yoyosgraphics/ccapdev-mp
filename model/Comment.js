const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  review_id: { type: String, required: true },
  content: { type: Date, required: true },
  edit_status: { type: Boolean, required: true },
  delete_status: { type: Boolean, required: true },
}, { collection: "comment-records" });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;