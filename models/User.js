const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  pin: { type: String, required: true, length: 6 },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  country: { type: String },
  birthdate: { type: Date, required: true },
});

module.exports = mongoose.model("User", userSchema);
