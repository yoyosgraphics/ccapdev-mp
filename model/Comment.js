const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const commentSchema = new mongoose.Schema({
  user_id: { type: ObjectId, ref: "User", required: true},
  review_id: { type: ObjectId, ref: "Review", required: true},
  content: { type: String, required: true },
  edit_status: { type: Boolean, required: true },
  delete_status: { type: Boolean, required: true },
}, { collection: "comment-records" });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;