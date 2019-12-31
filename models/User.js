const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
//   profile : {
//     type : mongoose.Schema.Types.ObjectId,
//     ref : "Profile"
// },
  firstname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  token : {
    type : String,
    required : false
  }
});

module.exports = mongoose.model("User", userSchema, "users");

