var localDB = true;
var express = require("express");
var mongoose = require("mongoose");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require('passport')
LocalStrategy = require('passport-local').Strategy;

var app = express();
var port = process.env.PORT || 3000;

if(localDB == true){
    //Local Database 
    mongoose.connect("mongodb://127.0.0.1/test_db");
  }
  else{
    //Database setup with mLab
    mongoose.connect(process.env.MONGODB_URI);
  }

//Setup
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));

//Message collection schema and conversion to Model
var Schema = mongoose.Schema
var msgSchema = new Schema ({
	title: String,
	body: String,
	author: String, //should be fetched from user info after Authentication (Passport.js)
	date: {type: Date, default: Date.now}
});

var msgBoard = mongoose.model("msgBoard", msgSchema);

//Database collection and conversion to Model
var userSchema = mongoose.Schema
var userSchema = new Schema ({
  username: String,
  password: String,
  extra: String,
  date: {type: Date, default: Date.now}
});

var userData = mongoose.model("userData", userSchema);

// Setup login for simple username/password auth
passport.use(new LocalStrategy(
  function(username, password, done) {
    userData.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

//=========== Routes Below =============


//Landing page - First page
app.get("/", function(req, res){
  res.render("landing");
});

//Index page - Second page
app.get("/index", function(req, res){
  res.render("index");
});

//Links page
app.get("/links", function(req, res){
  res.render("links");
});

//About CodeClub Page
app.get("/about", function(req, res){
  res.render("about");
});

//Contact Us Page
app.get("/contact", function(req, res){
  res.render("contact");
});

//Login Page
app.get("/login", function(req, res){
  res.render("login");
});

// Credentials check from login
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

// Validate login credentials
app.get("/login/:id", function(req, res){
  userData.findById(req.params.id, function(err, msg){
    if(err){
      console.log(err);
      res.redirect("/forum");
    } else {
      res.render("show", {msg: msg});
    }
  });
});


//Sign Up Page
app.get("/signup", function(req, res){
  res.render("signup");
});

//Post from Sign Up Page
app.post("/signup", function(req, res){
  console.log("signup post")
  userData.create(req.body.msg, function(err, msg){
    if(err){
      console.log(err);
      res.redirect("/index");
    } else {
      console.log("Name: ", req.body.msg.username);
      console.log("Password: ", req.body.msg.password);
//      userData.insertOne({
//        username: req.body.msg.username,
//        password: req.body.msg.password,
//      });
      res.redirect("/forum");
    }
  });
});

//Message Board Page - Showing all the posts
app.get("/forum", function(req, res){
	msgBoard.find({}, function(err, msg){
		if(err){
			console.log(err)
		} else {
			res.render("forum", {msg: msg});
		}
	});
});


//New Route - Form/page where you create a new post
app.get("/forum/new", function(req, res){
	res.render("new")
});

//Create(ing/ed) Route - The page the post has been created
app.post("/forum", function(req, res){
//mongodb commands, reading the parsing data, redirecting to Message Board page
	msgBoard.create(req.body.msg, function(err, msg){
		if(err){
			console.log(err);
			res.redirect("/forum");
		} else {
			res.redirect("/forum");
		}
	});
});

//Show Route - Viewing the full message/page of the created post
app.get("/forum/:id", function(req, res){
//mongodb commands, showing/finding msgs in detail (full)
msgBoard.findById(req.params.id, function(err, msg){
		if(err){
			console.log(err);
			res.redirect("/forum");
		} else {
			res.render("show", {msg: msg});
		}
	});
});

//Edit Route - Editing the post
app.get("/forum/:id/edit", function(req, res){
//mongodb commands,
msgBoard.findById(req.params.id, function(err, msg){
		if(err){
			console.log(err);
			res.redirect("/forum");
		} else {
			res.render("edit", {msg: msg});
		}
	});
});

//Update Route - Updating the post
app.put("/forum/:id", function(req, res){
	msgBoard.findByIdAndUpdate(req.params.id, req.body.msg, function(err, msg){
		if(err){
			console.log(err);
			res.redirect("/forum");
		} else {
			res.redirect("/forum");
		}
	});
});

//Delete Route - Deleting the post
app.delete("/forum/:id", function(req, res){
	msgBoard.findByIdAndRemove(req.params.id, function(err, msg){
		if(err){
			console.log(err);
		} else {
			res.redirect("/forum");
		}
	});
});


app.listen(port, function(){
	console.log("\n" + "=".repeat(40));
	console.log("*** INITIALIZATION ***");
	console.log("-".repeat(40));
  if(localDB == true) { console.log("Starting Server on http://localhost:3000"); }
  else                { console.log("Starting Server on ", process.env.MONGODB_URI); }
	console.log("Successfully connected to the Database");
	console.log("=".repeat(40) + "\n");
});
