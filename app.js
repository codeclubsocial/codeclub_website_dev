#!/usr/bin/env node

var express = require("express");
var session = require("express-session");
var cookieParser = require('cookie-parser');
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
var mongoose = require("mongoose");
var logger = require('morgan');
var path = require('path');
var ejs = require("ejs");
var MongoClient = require('mongodb').MongoClient;
var expressValidator = require('express-validator');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var app = express();
var port = process.env.PORT || 3000;

// Toggle Database Dev Mode
//=================================================
  var localDB = true; /* true: local, false: production */
//=================================================

  if(localDB == true) {
      // LOCAL
      mongoose.connect("mongodb://127.0.0.1/test_db", {useMongoClient: true});
    }
  else {
      // PRODUCTION
      mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
    }

//=================================================


//Setup
app.set("view engine", "ejs");
// app.use(logger('dev'));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(expressValidator);
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(flash());


require('./config/passport')(passport);

const { check, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

//Message collection schema and conversion to Model
var Schema = mongoose.Schema

var msgSchema = new Schema ({
	title: String,
	body: String,
	author: String, //should be fetched from user info after Authentication (Passport.js)
	date: {type: Date, default: Date.now}
});

var msgBoard = mongoose.model("msgBoard", msgSchema);

//=========== Test Routes =============

//Rich Text Test page
app.get("/rt", function(req, res){
  res.render("rt", {req: req});
});

//=========== Main Routes =============

//Landing page - First page
app.get("/", function(req, res){
  res.render("landing", {req: req});
});

//Index page - Second page
app.get("/index", function(req, res){
  res.render("index", {req: req});
});

//About CodeClub Page
app.get("/about", function(req, res){
  res.render("about", {req: req});
});

//Logout Page
app.get("/logout", function(req, res){
  req.logout();
  res.render("landing", {req: req});
});

//Login Page
app.get("/login", function(req, res){
  res.render("login", {req: req});
});

// Credentials check from login
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/secret',
  failureRedirect: '/login',
  failureFlash: 'Bad login'
}));

//Secret page - For testing passport sessions
app.get("/secret", function(req, res){
  if ( req.isAuthenticated() ){
    // Only authenticated users can reach the Secret page
    res.render("secret", {req: req});
  }
  else{
    // Else they go somewhere else
    res.render("errNotLoggedIn", {req: req});
  }
});

//Sign Up Page
app.get("/signup", function(req, res){
  res.render("signup", {req: req});
});

app.post('/signup', [
    check('email').isEmail().withMessage('Must be an email'),
//    check('email').isLength({ min: 1 }).withMessage('Cannot be empty'),
    check('password', 'passwords must be at least 5 chars long and contain one number').isLength({ min: 5 }).matches(/\d/),
], (req, res, next) => {
  // Get the validation result whenever you want; see the Validation Result API for all options!
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(" ");
    console.log("Errors array:");	
    console.log(errors.array());
    console.log( "Errors!");
    res.redirect("/")
  }else{ console.log("No Errors!"); passport.authenticate('local-signup', {successRedirect: '/index', failureRedirect: '/about'})(req,res);}

  // matchedData returns only the subset of data validated by the middleware
  const user = matchedData(req);
//  createUser(user).then(user => res.json(user));
});
/*
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/index',
  failureRedirect: '/signup',
  failureFlash: 'User email already registered'
    }));
*/    

// Contact Us Page
app.get('/contact', function(req,res) {
  res.render('contact', {alertDisplay: 'none', req: req});
});

// Contribute Page
app.get('/contribute', function(req,res) {
  res.render("contribute", {req: req});
});

// Contact Us with BS alert after form submit
app.get('/contact/alert/:alert', function(req,res) {
  console.log(req.params.alert);

  if(req.params.alert == 'true') {
    res.render('contact', {alertDisplay: 'block'});
  } else {
    res.render('contact', {alertDisplay: 'none'});
  }
});

// Contact Form Handler
app.post("/contactForm", function(req, res){

	let transporter = nodemailer.createTransport({
	    host: 'gator4210.hostgator.com',
	    port: 465,
	    secure: true,
	    auth: {
	        user: 'mailbot@codeclub.social',
	        pass: 'aD9edxHQPFzE9MxcZk' // need to save as env
	    }
		});

	var textMessage = "------ Submitted from www.codeclub.social/contact ------ \nFrom: " + req.body.contactName + "\nEmail: " + req.body.contactEmailAddress +
			"\nMessage: " + req.body.contactInquiry + "\n-------------------------------------------------------";


	var htmlMessage = "------ Submitted from www.codeclub.social/contact ------<br><b>From: </b>" + req.body.contactName + "<br><b>Email: </b>" + req.body.contactEmailAddress +
			"<br><b>Message: </b>" + req.body.contactInquiry + "<br>-------------------------------------------------------";


	let mailOptions = {
			from: '"Contact Us Form" <mailbot@codeclub.social>', // sender address
			to: ['brianjason@gmail.com', 'zaki.sediqyar@gmail.com'], // list of receivers
			//to: ['brianjason@gmail.com'], // list of receivers
			subject: req.body.contactName + " has submitted an inqury", // Subject line
			text: textMessage, // plain text body
			html: htmlMessage // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
					return console.log(error);
			}
			console.log('Message %s sent: %s', info.messageId, info.response);
	});

	res.redirect("/contact/alert/true")
});


//=========== Forum Routes =============

//Message Board Page - Showing all the posts
app.get("/forum", function(req, res){
	if ( req.isAuthenticated() ){
		msgBoard.find({}, function(err, msg){
			if(err){
				console.log(err)
			} else {
				res.render("forum", {msg: msg, req: req});
			}
		});
	}
	else{
	    res.render("errNotLoggedIn", {req: req});
	}

});

//New Route - Form/page where you create a new post
app.get("/forum/new", function(req, res){
	if ( req.isAuthenticated() ){
		res.render("new", {req: req})
	}
	else{
	    res.render("errNotLoggedIn", {req: req});
	}
});

//Create(ing/ed) Route - The page the post has been created
app.post("/forum", function(req, res){
//mongodb commands, reading the parsing data, redirecting to Message Board page
	msgBoard.create(req.body.msg, function(err, msg){
		if(err){
			console.log(err);
		}
		res.redirect("/forum");
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
			res.render("show", {msg: msg, req: req});
		}
	});
});

//Edit Route - Editing the post
app.get("/forum/:id/edit", function(req, res){
//mongodb commands
	msgBoard.findById(req.params.id, function(err, msg){
			if(err){
				console.log(err);
				res.redirect("/forum");
			} else {
				res.render("edit", {msg: msg, req: req});
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



// ---------------------------------------------------------------

app.listen(port, function(){
	console.log("\n" + "=".repeat(40));
	console.log("*** INITIALIZATION ***");
	console.log("-".repeat(40));
  console.log("Starting Server on http://localhost:3000");
	console.log("Successfully connected to the Database");
	console.log("=".repeat(40) + "\n");
});
