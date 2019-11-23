const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  name: { type: String, required: true },
  msg: { type: String, required: true }
});

mongoose.model("comment", commentSchema);
