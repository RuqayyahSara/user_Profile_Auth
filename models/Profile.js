const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    bio : {
        type : String,
        required : true
    },
    location : {
        type : String
    },
    skills : {
        type : [String],
        required : true
    },
    experience : [
        {
            title : {
                type : String,
                required : true
            },
            company : {
                type : String,
                required : true
            },
            location : {
                type : String
            }
        }
    ],
    date : {
        type : Date,
        default :Date.now
    }
});

module.exports = mongoose.model("Profile", profileSchema, "users_profile");