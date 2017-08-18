var express = require("express");
var mongoose = require("mongoose");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

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


//Landing page - First page
app.get("/", function(req, res){
	res.render("landing");
});



//Index Page - Showing all the posts
app.get("/msgs", function(req, res){
	msgBoard.find({}, function(err, msg){
		if(err){
			console.log(err)
		} else {
			res.render("index", {msg: msg});
		}
	});
});


//New Route - Form/page where you create a new post
app.get("/msgs/new", function(req, res){
	res.render("new")
});

//Create(ing/ed) Route - The page the post has been created
app.post("/msgs", function(req, res){
//mongodb commands, reading the parsing data, redirecting to index page
	msgBoard.create(req.body.msg, function(err, msg){
		if(err){
			console.log(err);
			res.redirect("/msgs");
		} else {
			res.redirect("/msgs");
		}
	});
});

//Show Route - Viewing the full message/page of the created post
app.get("/msgs/:id", function(req, res){
//mongodb commands, showing/finding msgs in detail (full)
msgBoard.findById(req.params.id, function(err, msg){
		if(err){
			console.log(err);
			res.redirect("/msgs");
		} else {
			res.render("show", {msg: msg});
		}
	});
});

//Edit Route - Editing the post
app.get("/msgs/:id/edit", function(req, res){
//mongodb commands,
msgBoard.findById(req.params.id, function(err, msg){
		if(err){
			console.log(err);
			res.redirect("/msgs");
		} else {
			res.render("edit", {msg: msg});
		}
	});
});

//Update Route - Updating the post
app.put("/msgs/:id", function(req, res){
	msgBoard.findByIdAndUpdate(req.params.id, req.body.msg, function(err, msg){
		if(err){
			console.log(err);
			res.redirect("/msgs");
		} else {
			res.redirect("/msgs");
		}
	});
});

//Delete Route - Deleting the post
app.delete("/msgs/:id", function(req, res){
	msgBoard.findByIdAndRemove(req.params.id, function(err, msg){
		if(err){
			console.log(err);
		} else {
			res.redirect("/msgs");
		}
	});
});








//Port configuration

app.listen(port, function(){

	console.log("Starting Server on port 3000...");
	console.log("Successfully connected to the Database");
});
