var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var passportLocalMongoose = require("passport-local-mongoose");

router.get("/", isLoggedIn, function(req, res){
	res.render("landing");
});

// router.get("/register", function(req, res) {
//    res.render("register"); 
// });

// router.post("/register", function(req, res) {
//    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
//    		if(err){
//    			console.log(err);
//    			return res.render("register");
//    		}
//    		passport.authenticate("local")(req, res, function(){
//    			res.redirect("/");
//    		});
//    });
// });

router.get("/login", function(req, res) {
   res.render("login"); 
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/login"
        
    }), function(req, res) {
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next;
    }
    res.redirect("/login");
}

module.exports = router;