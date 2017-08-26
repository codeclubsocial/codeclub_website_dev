var express = require("express");
var mongoose = require("mongoose");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var nodemailer = require('nodemailer');


var app = express();
var port = process.env.PORT || 3000;

//Database setup with mLab
mongoose.connect(process.env.MONGODB_URI);

//Setup
// mongoose.connect("mongodb://127.0.0.1/test_db");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));


//Database Schema and conversion to Model
var Schema = mongoose.Schema
var msgSchema = new Schema ({
	title: String,
	body: String,
	author: String, //should be fetched from user info after Authentication (Passport.js)
	date: {type: Date, default: Date.now}
});

var msgBoard = mongoose.model("msgBoard", msgSchema);


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

//Sign Up Page
app.get("/signup", function(req, res){
  res.render("signup");
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
	console.log("Starting Server on http://localhost:3000");
	console.log("Successfully connected to the Database");
	console.log("=".repeat(40) + "\n");
});
