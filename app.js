#!/usr/bin/env node

var express = require("express");
var session = require("express-session");
var initialize = require('express-init');

var bodyParser = require("body-parser");
var compression = require('compression');
var cookieParser = require('cookie-parser');
var methodOverride = require("method-override");

var logger = require('morgan');
var passport = require('passport');

var fs = require('fs');
var ejs = require("ejs");

var flash = require('connect-flash');
var nodemailer = require('nodemailer');
var htmlToText = require('html-to-text');

var path = require('path');
var http = require('http');
var https = require('https');

var mongoose = require("mongoose");
var MongoClient = require('mongodb').MongoClient;
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;

var httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

var app = express();
var port = process.env.PORT || 3000;
var currUsername = null;

// Disable log-in check for development
//=================================================
  var enableAuth = true; /* true: normal behavior, false:don't check logged in status */
//=================================================

// Toggle Database Dev Mode
//=================================================
  var localDB = false; /* true: local, false: production */
//=================================================

  if(localDB) {
      // LOCAL
      mongoose.connect("mongodb://127.0.0.1/test_db", {useMongoClient: true});
    }
  else {
      // PRODUCTION
      mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
    }

//=================================================

// A wrapper function for the passport authentication.
// enableAuth=false bypasses login check to prevent developers from having
// to re-login every time they restart the server. FOR DEVELOPMENT ONLY!
app.locals.authenticate=(
		function(req)
		{
				if (enableAuth == true){ return(req.isAuthenticated()) }
				else{ return true }
		});

//Setup
app.set("view engine", "ejs");
app.use(compression());

app.use(express.static("public"));
app.use('/modules', express.static('node_modules'));

//app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }));

// No timeout on session key, so effectively infinite
// Set session cookie age to 86400 seconds=1 day
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use(methodOverride("_method"));
app.use(flash());

// app.use(logger('dev'));

var verifyEmail =  ' ';
var rand = 0;

var verifyEmail =  ' ';
var rand = 0;


require('./config/passport')(passport);
var User = require('./models/user');

const { check, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const assert = require('assert');

//Message collection schema and conversion to Model
var Schema = mongoose.Schema

var msgSchema = new Schema ({
	title: String,
	body: String,
  text: String,
	author: String, //should be fetched from user info after Authentication (Passport.js)
	dateCreated: {type: Date, default: Date.now},
  dateModified: Array,
  comments: Array,
  vote: Object,
  voters: Object
});

var msgBoard = mongoose.model("msgBoard", msgSchema);

//=========== Main Routes =============

//Landing page - First page
app.get("/", function(req, res){
  if(req.originalURL == '/dev/') {
    res.redirect('/');
  } else if ( app.locals.authenticate(req) ){
    // If session cookie active (previous visitor) direct to index
    res.render("index", {req: req});
  }
  else{
    // If session cookie not active (not registered or verified) direct to landing
    res.render("index", {req: req});
  }
});

/*
app.get("/dev", function(req, res){
    req.url = "http://codeclubsocial.herokuapp.com/";
    app.handle(req, res);
  }
);
*/
app.get("/dev", function(req, res){
    res.redirect("https://codeclubsocial.herokuapp.com/");
  }
);

/*
app.get('/*', function(req, res, next) {
    if (req.headers.host.match(/^www/) !== null ) res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url, 301);
    else next();
});
*/

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
  res.render("login", {req: req, message: req.flash('error')});
});

// Credentials check from login
// app.post('/login', passport.authenticate('local-login', {
//   successRedirect: '/secret',
//   failureRedirect: '/login',
//   failureFlash: true
// }));

app.post('/login', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      currUsername = user.local.username;
      return res.redirect('/secret');
    });
  })(req, res, next);
});

//Secret page - For testing passport sessions
app.get("/secret", function(req, res){
  if ( app.locals.authenticate(req) ){
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
    res.render("signup", {req: req, message: req.flash('error')});
});

//EMail verification after sign up
app.get("/verify", function(req, res){
    // Passport signup logs the user in on success.
    // Turn that off until the verify is complete.
    req.logout();

    // If it is a query it's a validation email response
    if (req.query.id) {
	if ( rand == req.query.id) {
	    User.findOneAndUpdate( {'local.email':verifyEmail}, {'$set':{'local.verified': true}}, function(err, doc){
		if (err) return handleError(err);
	    });
	    res.render("login", {req: req, message: 'You are verified. You may now log in.'});
	}
	else{
	    console.log("Request is from unknown source");
	}
    }
    // Else we fire off a validation email
    else{
        let transporter = nodemailer.createTransport({
	    host: 'gator4210.hostgator.com',
	    port: 465,
	    secure: true,
	    auth: {
		user: 'mailbot@codeclub.social',
		pass: 'aD9edxHQPFzE9MxcZk' // need to save as env
	    }
	});

	rand=Math.floor((Math.random() * 100) + 54);
	host=req.get('host');
	link="http://"+req.get('host')+"/verify?id="+rand;

	var htmlMessage = "Hello,<br> Please click on the link to verify your email.<br><a href="+link+">Click here to verify</a>";
	var textMessage = "------ Verification Email ------ \nFrom: CodeClub Admin" + "\nEmail: mailbot@codeclub.social" +
	    "\nMessage: " + req.body.contactInquiry + "\n-------------------------------------------------------";

	let mailOptions = {
	    from: '"Verification Email" <mailbot@codeclub.social>', // sender address
	    to: verifyEmail,						// verification address
	    subject: "Codeclub Verification Email ", 		// Subject line
	    text: textMessage, 					// plain text body
	    html: htmlMessage 					// html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
	    if (error) {
	    return console.log(error);
	    }
	});
    res.render("verify", {req: req, message: req.flash('info')});
    }
});

app.post('/signup', [
    check('email').isEmail(),
    check('password').isLength({ min: 5 }).matches(/\d/)
    ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
	if (errors.array()[0].param == 'email') {
	    req.flash('error','Email field must contain a valid e-mail address');
	}
	else if (errors.array()[0].param == 'password') {
	   req.flash('error','Passwords must be at least 5 characters long and contain one number');
	}
	res.render('signup', {req: req, message: req.flash('error')});
    }else if (req.body.username.length < 1) {
	req.flash('error','Username cannot be empty');
	res.render('signup', {req: req, message: req.flash('error')});
    }else if (req.body.username.match(/ /g)) {
	req.flash('error','Username cannot contain space(s)');
	res.render('signup', {req: req, message: req.flash('error')});
    }else{
	verifyEmail = req.body.email;
	passport.authenticate('local-signup', {
	    successRedirect: '/verify',
	    failureRedirect: '/signup',
	    failureFlash: req.flash('error')})(req,res);
    }
});

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
    res.render('contact', {alertDisplay: 'block', req: req});
  } else {
    res.render('contact', {alertDisplay: 'none', req: req});
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

	rand=Math.floor((Math.random() * 100) + 54);
	host=req.get('host');
	link="http://"+req.get('host')+"/verify?id="+rand;

	var textMessage = "------ Submitted from www.codeclub.social/contact ------ \nFrom: " + req.body.contactName + "\nEmail: " + req.body.contactEmailAddress +
			"\nMessage: " + req.body.contactInquiry + "\n-------------------------------------------------------";


	var htmlMessage = "------ Submitted from www.codeclub.social/contact ------<br><b>From: </b>" + req.body.contactName + "<br><b>Email: </b>" + req.body.contactEmailAddress +
			"<br><b>Message: </b>" + req.body.contactInquiry + "<br>-------------------------------------------------------";


	let mailOptions = {
			from: '"Contact Us Form" <mailbot@codeclub.social>', // sender address
			to: ['brianjason@gmail.com', 'zaki.sediqyar@gmail.com', 'craig429@mac.com'], // list of receivers
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
	if ( app.locals.authenticate(req)){
		msgBoard.find({}, function(err, msg){
			if(err){
				console.log(err)
			} else {
        msg.text = htmlToText.fromString(msg.body);
				res.render("forum", { msg: msg, req: req });
      }
		});
	}
	else{
	    res.render("errNotLoggedIn", {req: req});
	}

});

//New Route - Form/page where you create a new post
app.get("/forum/new", function(req, res){
	if ( app.locals.authenticate(req) ){
		res.render("editor", {msg: "", req: req})
	}
	else{
	    res.render("errNotLoggedIn", {req: req});
	}
});

//Create(ing/ed) Route - The page the post has been created
app.post("/forum", function(req, res){
  req.body['body'] = req.body['trumbowyg-editor'];
  req.body['text'] = htmlToText.fromString(req.body['trumbowyg-editor']);
  req.body['author'] = currUsername;
  req.body['comments'] = [];
  req.body.vote = {
    likes: 0,
    dislikes: 0
  };
  // Mongoose bug deletes empty objects
  req.body.voters = {"1":1};
  delete req.body['trumbowyg-editor']

  msgBoard.create(req.body, function(err, msg){
    if(err){
      console.log(err);
    }
    res.redirect("/forum");
  });
});

app.get('/getdate/:id', function(req, res) {
  if (req.params.id == "forum") {
    msgBoard.find({}, function(err, msg) {
      if (err) {
        console.log(err);
      }
      else {
        res.send(msg);
      }
    });
  }
  else {
    msgBoard.find({"_id":req.params.id}, function(err, msg) {
      if (err) {
        console.log(err);
      }
      else {
        res.send(msg);
      }
    });
  }
});

//Show Route - Viewing the full message/page of the created post
app.get("/forum/:id", function(req, res){
//mongodb commands, showing/finding msgs in detail (full)
msgBoard.findById(req.params.id, function(err, msg){
		if(err){
			console.log(err);
			res.redirect("/forum");
		} else {
			res.render("show", {msg: msg, req: req, currUsername: currUsername});
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
			}
      else if (msg.author !== currUsername) {
        res.redirect("/forum/" + req.params.id);
      }
      else {
				res.render("editor", {msg: msg, req: req});
			}
		});
});

//Update Route - Updating the post
app.put("/forum/:id", function(req, res){
  //req.body.dateModified = {type: Date, default: Date.now};
  req.body.body = req.body['trumbowyg-editor'];
  req.body.text = htmlToText.fromString(req.body['trumbowyg-editor']);
  req.body.author = currUsername;

  delete req.body['trumbowyg-editor']

  //console.log(req.body);

	msgBoard.findByIdAndUpdate(req.params.id, req.body, function(err, msg){

		if(err){
			console.log(err);
			res.redirect("/forum");
		} else {
			res.redirect("/forum");
		}
	});
});

//Update Route - Updating the post
app.post("/forum/:id", function(req, res){
  //req.body.dateModified = {type: Date, default: Date.now};
  var newComment = {}
  newComment.body = req.body['trumbowyg-comment-editor'];
  newComment.text = htmlToText.fromString(req.body['trumbowyg-comment-editor']);
  newComment.author = currUsername;
  newComment.dateCreated = new Date(Date.now());
  var commentsArr;
	msgBoard.find({"_id":req.params.id}, function(err, msg) {
    if (err) {
      console.log(err);
    }
    else {
      msg[0].comments.push(newComment);
      msgBoard.findByIdAndUpdate(req.params.id, msg[0], function(err, msg){
    		if(err) {
    			console.log(err);
    			res.redirect("/forum/"+req.params.id);
    		}
        else {
          res.redirect("/forum/"+req.params.id);
    		}
    	});
    }
  });
});

app.post("/forum/:id/vote", function(req, res) {
  msgBoard.find({"_id":req.params.id}, function(err, msg) {
    if (err) {
      console.log(err);
    }
    else {
      updatedMsg = msg[0];
      if (currUsername in updatedMsg.voters) {
        if (updatedMsg.voters[currUsername] !== req.body.vote) {
          updatedMsg.vote.likes = parseInt(updatedMsg.vote.likes) + parseInt(req.body.vote);
          updatedMsg.vote.dislikes = parseInt(updatedMsg.vote.dislikes) + parseInt(updatedMsg.voters[currUsername]);
          updatedMsg.voters[currUsername] = req.body.vote;
        }
      }
      else {
        updatedMsg.voters[currUsername] = req.body.vote;
        if (req.body.vote == 1) {
          updatedMsg.vote.likes = parseInt(updatedMsg.vote.likes) + parseInt(req.body.vote);
        }
        else {
          updatedMsg.vote.dislikes = parseInt(updatedMsg.vote.likes) - parseInt(req.body.vote);
        }
      }

      msgBoard.findByIdAndUpdate(req.params.id, updatedMsg, {new:true}, function(err, msg) {
        if(err) {
          console.log(err);
        }
        else {
          res.send(msg.vote);
        }
      });
    }
  })
})

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
initialize(app, function(err) {
    if (err)
        throw new Error(err);

    // Redirect from insecure to secure server
//    http.createServer(function (req, res) {
//        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//        res.end();
//    }).listen(80);

    // Instantiate secure server
//    https.createServer(httpsOptions, app).listen(443);

    // Back door HTTP for development. Turn off in production.
    http.createServer(app).listen(port);

    // Say hello to the folks
    console.log("\n" + "=".repeat(40));
    console.log("*** INITIALIZATION ***");
    console.log("-".repeat(40));

    // Flag local development DB
    if (localDB == true) { console.log("Using Mongoose DB Server on localhost"); }
    // Or official CodeClub DB
    else{console.log("Using CodeClub production DB");}

    console.log("Successfully connected to the Database");
    console.log("=".repeat(40) + "\n");
});
