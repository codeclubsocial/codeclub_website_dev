var like = document.querySelector("#like");
var likeText = document.getElementById("likeText");
var likeCount = 0;

var dislike = document.getElementById("dislike");
var dislikeText = document.getElementById("dislikeText");
var dislikeCount = 0;

var clicked = false;


//basic front-end part is done, only need to do some calculation and storing the numbers to be permanent


//like button
like.addEventListener("click", function(){
  this.classList.add("like");
  dislike.classList.remove("dislike");
});

like.addEventListener("mouseover", function(){
  this.style.color = "#0275d8";
  this.style.cursor = "pointer";
});

like.addEventListener("mouseout", function(){
  this.style.color = "";
});


//dislike button
dislike.addEventListener("click", function(){
  this.classList.add("dislike");
  like.classList.remove("like");
});

dislike.addEventListener("mouseover", function(){
  this.style.color = "#d9534f";
  this.style.cursor = "pointer";
});

dislike.addEventListener("mouseout", function(){
  this.style.color = "";
});
