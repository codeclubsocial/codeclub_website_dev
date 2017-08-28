var localDB = true;
var express = require("express");
var session = require("express-session");
var mongoose = require("mongoose");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var nodemailer = require('nodemailer');
var passport = require('passport'),LocalStrategy = require('passport-local').Strategy;


var app = express();
var port = process.env.PORT || 3000;
var user_cache=[];

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
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));
app.use(passport.initialize());
app.use(passport.session());

/*
// Experimental middleware calls
app.use(function (req, res, next) {
  console.log('App call @ ', Date.now())
  next()
})
app.use('/forum', function (req, res, next) {
  console.log('FRequest Type:', req.method)
  next()
})
app.use('/about', function (req, res, next) {
  console.log('Request URL:', req.originalUrl)
  next()
}, function (req, res, next) {
  console.log('ARequest Type:', req.method)
  next()
})
*/

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

passport.serializeUser(function(user, done) {
  let id = user._id;
  user_cache[id] = user;
//  next(null, id);

//  done(null, user.username);
//  done(null, user);
});

passport.deserializeUser(function(user, done) {
  userData.findById(user._id, function(err, user) {
    done(err, user);
  });
});

// Setup login for simple username/password auth
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log(" ")
    console.log(" ")
    console.log(" ")
    console.log(" ")
    console.log("Username: " + username )
    console.log("Password: " + password )
    userData.findOne({ username: username }, function(err, user) {
      console.log( "Marker 1" );
      if (err) { console.log( "Marker 2" ); return done(err) }
      else if (!user) {
        console.log( "Marker 3" );
        console.log("User %s not registered!", username );
        return done(null, false, { message: 'Incorrect username.' });
      }
      else if (password != user.password) {
        console.log( "Incorrect password for %s. Should be: %s.", user.username,  user.password )
        return done(null, false, { message: 'Incorrect password.' });
      }
      else {
        console.log("User %s authenicated!", user.username );
        return done(null, true );
//        return done(null, true, { message: 'Good stuff.' });
//        return done();
      }
    });
  }
));

//=========== Routes Below =============

//Rich Text Test page
app.get("/rt", function(req, res){
  res.render("rt");
});

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
// app.get("/about", function(req, res){
app.get('/about', function(req, res, next) {
  if (req.session.views) {
    req.session.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + req.session.views + '</p>')
    res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    req.session.views = 1
    res.end('welcome to the session demo. refresh!')
  }
//  res.render("about");
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
// app.post("/login", passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

app.post("/login", passport.authenticate('local'), function(req, res){

  userData.count({ username }, function(err, count){
    if(err){ console.log(err);}
    else{console.log('There are %d users registered.', count);}
  });

  successRedirect: '/';
  failureRedirect: '/';
/*
  userData.findOne({ username: req.body.username }, function(err, user){
    if(err){ console.log(err);}
    else{
      if( !user ){
        console.log( "Could not find user "+req.body.username + " in our database!" ); 
        res.render("signup");
      }
      else{
        console.log('Logging in: ', user.username)
        res.redirect("/forum");
      }
    }
  });
*/
});

//Sign Up Page
app.get("/signup", function(req, res){
  res.render("signup");
});

//Post from Sign Up Page
app.post("/signup", function(req, res){
  userData.create(req.body.msg, function(err, msg){
    if(err){
      console.log(err);
      res.redirect("/index");
    } else {
      console.log("Created new user: ", req.body.msg.username);
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


// Contact Form Handler
app.post("/contactForm", function(req, res){
	var alertSuccess = false;
	//console.log(req.body.contactName);
  //console.log(req.body.contactEmailAddress);
  //console.log(req.body.contactInquiry);

	let transporter = nodemailer.createTransport({
	    host: 'gator4210.hostgator.com',
	    port: 465,
	    secure: true,
	    auth: {
	        user: 'mailbot@codeclub.social',
	        pass: 'aD9edxHQPFzE9MxcZk'
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
