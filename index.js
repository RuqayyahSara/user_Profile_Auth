const express = require("express");
const config = require("config");
require("./dbConnect");
var profileRouter = require('./routes/profile');
var usersRouter = require('./routes/users');
// setup express
const app = express();
// setup port
const port = process.env.PORT || config.get("port");
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//setup routes
app.use('/profile', profileRouter);
app.use('/', usersRouter); 
// connect to server
app.listen(port,(err)=>{
    if(err)
    throw err;
    console.log(`Listening to server on port:${port}`);
})