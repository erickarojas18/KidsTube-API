const mongoose = require("mongoose");

const RestrictedUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pin: { type: String, required: true, minlength: 6, maxlength: 6 },
  avatar: { type: String, required: true },
  parentUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("RestrictedUser", RestrictedUserSchema);
