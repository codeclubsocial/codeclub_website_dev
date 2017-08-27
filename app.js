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
app.use(session({ secret: 'keyboard cat' }));
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

// Setup login for simple username/password auth
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("Marker 1")
    userData.findOne({ username: username }, function(err, user) {
      if (err) { console.log("Marker 2"); return done(err); }
      if (!user) {
        console.log("Marker 3");
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        console.log("Marker 4");
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log("Marker 5");
      return done(null, user);
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
app.post("/login", function(req, res){

/*
  userData.count({ username }, function(err, count){
    if(err){ console.log(err);}
    else{console.log('There are %d users registered.', count);}
  });
*/
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

app.post("/contactForm", function(req, res){
	console.log(req.body.contactName);
  console.log(req.body.contactEmailAddress);
  console.log(req.body.contactInquiry);


	let transporter = nodemailer.createTransport({
	    host: 'gator4210.hostgator.com',
	    port: 465,
	    secure: true,
	    auth: {
	        user: 'mailbot@codeclub.social',
	        pass: 'aD9edxHQPFzE9MxcZk'
	    }
		});

	let mailOptions = {
			from: '"Contact Us Form" <mailbot@codeclub.social>', // sender address
			to: ['brianjason@gmail.com', 'zaki.sediqyar@gmail.com'], // list of receivers
			subject: req.body.contactName + " has submitted an inqury", // Subject line
			text: "From: " + req.body.contactName + " <" + req.body.contactEmailAddress + ">\n" +
						"Message: " + req.body.contactInquiry, // plain text body
			html: '<div style="text-color: lightgray;">##### Submitted from www.codeclub.social/contact #####</div><br>' + "<b>From:</b> " + req.body.contactName + " <" + req.body.contactEmailAddress + "><br>" +
						'<b>Message:</b> ' + req.body.contactInquiry // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
					return console.log(error);
			}
			console.log('Message %s sent: %s', info.messageId, info.response);
	});

});

/*** Working On this with Zaki & Baijian
gator4210.hostgator.com
//Create(ing/ed) Route - The page the post has been created
app.post("/contactForm", function(req, res){
	//req.body.title
	// setup email data with unicode symbols
	let mailOptions = {
	    from: '"Fred Foo 👻" <foo@blurdybloop.com>', // sender address
	    to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
	    subject: 'Hello ✔', // Subject line
	    text: 'Hello world ?', // plain text body
	    html: '<b>Hello world ?</b>' // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
	    if (error) {
	        return console.log(error);
	    }
	    console.log('Message %s sent: %s', info.messageId, info.response);
	});
});
**/



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
