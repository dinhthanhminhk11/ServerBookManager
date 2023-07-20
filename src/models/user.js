const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  image: {
    type: String
  },
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    minlength: 6,
  }, role: {
    type: Number,
    default: 0,
  }
})
module.exports = mongoose.model("User", userSchema);
