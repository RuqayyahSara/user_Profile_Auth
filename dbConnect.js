const mongoose = require("mongoose");
const config = require("config");

const mongoURI = config.get("mongoURI");
mongoose.connect(mongoURI,{useNewUrlParser: true , useUnifiedTopology: true }, (err)=> {
    if(err) 
    throw err;
    console.log("Server connected to DataBase");
});

