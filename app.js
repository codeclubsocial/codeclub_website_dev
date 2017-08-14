// mongoose config needs to be updated according to:
// https://github.com/mongolab/mongodb-driver-examples/blob/master/nodejs/mongooseSimpleExample.js

var express = require("express");
var mongoose = require("mongoose");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

var app = express();

//Setup
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));

// MONGODB URI: localhost or heroku?

if(process.env.MONGODB_URI !== undefined) {
	var uri = process.env.MONGODB_URI
	var port = 8080
} else {
	var uri = "mongodb://127.0.0.1/test_db"
	var port = 3000
}


// var uri = process.env.MONGODB_URI
// var uri = "mongodb://127.0.0.1/test_db"

mongoose.Promise = global.Promise
mongoose.connect(uri);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback ()	{
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


	//Landing page - First page (root)
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
	});

	//Edit Route - Editing the post
	app.get("/msgs/:id/edit", function(req, res){
		//mongodb commands,
	});

	//Update Route - Updating the post
	app.put("/msgs/:id", function(req, res){

	});

	//Delete Route - Deleting the post
	app.delete("/blogs/:id", function(req, res){

	});

	app.listen(port, function(){
		console.log("\n");
		console.log("Starting Server on port " + port + "...");
		//console.log("Successfully connected to the Database");
		console.log("MongoDB database => " + uri);
	});

});
