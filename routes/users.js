var express = require('express');
const config = require("config");
const { check, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
var gravatar = require('gravatar');
const jwt = require("jsonwebtoken");

//set Router
var router = express.Router();
// Import files
var User = require("../models/User");
var auth = require("../middleware/auth");
const Profile = require("../models/Profile");

// Sign-up POST - request

router.post("/signup", [
check("firstname", "Enter first name").not().isEmpty(),
check("email", "Enter a valid email address").isEmail(),
check("mobile", "Enter a valid mobile number").not().isEmpty(),
check("password", "Password should contain minimum 6 characters").isLength({min: 6})
], async (req, res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
    try{
      const {firstname, email, password, mobile} = req.body;
      const user = await User.findOne({email: email});
      if(user){
        return res.status(400).json({errors: [{msg: "User Already exists"}]});
      }
    
      const avatar = gravatar.url(email, {s: '200', r: 'pg', d: 'mm'});
      var newUser = new User({firstname, email, mobile, password, avatar});
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash;

      const saveUser = await newUser.save();
      res.json(saveUser);
      }
    
  catch(err){
      console.log(err);
      res.status(400).json({ errors: [{status:"Error in saving into Database"}] });
  }
});

// Login POST - request

router.post("/login", [
    check("firstname", "Enter first name").not().isEmpty(),
    check("email", "Enter a valid email").isEmail(),
    check("mobile", "Enter a valid mobile number").not().isEmpty(),
    check("password", "Password should contain minimum 6 characters").isLength({min: 6})
    ], async (req, res)=>{
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      else{
      const {email, password} = req.body;
      try{
         // check if user exists 
        const user = await User.findOne({email: email});
        if(!user){
          return res.status(422).json({ errors: [{msg: "Auth failed"}] });
        }
        // check if the given password matches the one in database
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
          return res.status(400).json({ errors: [{msg: "Invalid credentials!"}] });
        }
        // create payload
        const payload = {
            id : user.id
        };
       // create token
        const token = jwt.sign(payload, config.get("jwtSecret"), {expiresIn: 3600});
        res.status(200).json({msg: "Auth successful",token:token});
    }
      catch(err){
        res.status(500).send("Login Error!");
    }
    }
    });

// GET - users
router.get('/users/', async (req, res) => {
	try {
		const users = await User.find({}, ' firstname email -_id');
		res.json(users);
	} catch (err) {
		if (err) {
			return res.status(422).json({ Status: 'Error' });
		}
	}
});

// DELETE - logged in user account
router.delete("/delete/user", auth, async(req, res)=> {
	try{
		let profile = await Profile.findOne({user:req.user.id});
		let current_user = await User.findById(profile.user);
		console.log(current_user);
		const success = await User.findByIdAndDelete(current_user);
		if(success){
			await Profile.findByIdAndDelete(profile);
			return res.send("User Deleted SuccessfullY!");
		}
	}
	catch(err){
		res.status(500).send("Server error");
	}
});
module.exports = router;

