var express = require('express');
const config = require("config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require('express-validator');

// Import files
var User = require("../models/User");
var auth = require("../middleware/auth");
const Profile = require("../models/Profile");
var router = express.Router();

// Profile POST - request

router.post(
	'/',
	[
		auth,
		[ check('bio', 'Enter Bio').not().isEmpty(), check('skills', 'Skills Fields are Required').not().isEmpty() ]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { bio, location, skills } = req.body;
		//Building Profile Object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (skills) {
			profileFields.skills = skills.split(',').map((skill) => skill.trim());
		}

		try {
            let profile = await Profile.findOne({ user: req.user.id });
            // update profile
			if (profile) {
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.json(profile);
            }
			//Create A Profile
			let newProfile = new Profile(profileFields);
			await newProfile.save();
            return res.json(newProfile);
            
		} catch (err) {
			res.status(500).send('Profile Update failed');
		}
	}
);
// Update or Add Experience; PUT - request
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Enter Title').not().isEmpty(),
			check('company', 'Enter Company Name').not().isEmpty(),
			check('location', 'Enter Work Location').not().isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
    }
    const {title,company,location} = req.body;
    const experience_fields = {};
    experience_fields.title = title;
    experience_fields.company = company;
    experience_fields.location = location;
    try{
      let profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(experience_fields);
      await profile.save();
      res.send(profile);

    }catch(err){
      res.status(500).send("Server Error");
    }
	}
);

//GET Public Profile Details

router.get("/users", async (req,res)=>{
    const profiles = await Profile.find().populate("user","firstname avatar email mobile -_id");
    res.send(profiles);
})

// GET a user Profile (restricted)
router.get("/user",auth, async (req,res)=>{
    try{
    let profile = await Profile.findOne({user:req.user.id}).populate("user","firstname email mobile avatar -_id");
    if(profile){
       return  res.json(profile);
    }
    res.status(201).send("No profile found for this user");
    }
 catch(err){
    res.status(400).send("Access denied!");
}
})

// GET - user Profile by passing User_ID as a param
router.get("/user/:id",async (req,res)=>{
    let profile = await Profile.findOne({user:req.params.id}).populate("user","firstname email mobile avatar -_id");
    try{
        if(profile){
            return res.status(200).json(profile); 
        }
        res.status(404).send("Cannot retrieve data");
    }catch(err){
        res.status(400).send("Invalid");
    }
})

// DELETE - user-profile experience
router.delete("/delete/:exp_id",auth, async (req,res)=>{
	try{
		const profile = await Profile.findOne({user : req.user.id});
        const removeIndex = profile.experience.map((item)=>{ 
            return (item._id)})
            .indexOf(req.params.exp_id);
         console.log(removeIndex);
		profile.experience.splice(removeIndex,1); //splicing the experience id
		await profile.save();
		res.send(profile);

	}catch(err){
		res.status(500).send("Server Error");
	}
});

module.exports = router;

