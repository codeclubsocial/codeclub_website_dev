console.log("main.js");
/**************************
        chat toggle
**************************/
var toggleDisplay = function(){
  var chatDiv = document.getElementById('chatApp');
  var bodyDiv = document.getElementById('bodyContents');
  var chatLink = document.getElementById('chatButton');

  if (chatDiv.style.display === 'none'){
    chatDiv.style.display="block";
    bodyDiv.style.display="none";
    document.body.style.marginTop="3.5rem";
    document.body.style.backgroundColor="#04436a";
    //chatLink.style.color="#02ACEC";
  }
  else {
    chatDiv.style.display="none";
    bodyDiv.style.display="block";
    document.body.style.marginTop="5rem";
    document.body.style.backgroundColor="";
    //chatLink.style.color="";
  }
};

/**************************
       like buttons
**************************/
/*
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
*/
/**************************
  signup field validation
**************************/
var elem = {
  pass: document.getElementById("password"),
  confPass: document.getElementById("confirmPassword"),
  notice: {
    match: document.getElementById("passwordNoticeMatch"),
    len: document.getElementById("passwordNoticeLength"),
    reqchar: document.getElementById("passwordNoticeReqChar")
  }
};

var passwords = {
  isMatching: function() {
    return (elem.pass.value === elem.confPass.value);
  },
  isFiveCharsLong: function(){
    return (elem.pass.value.length >= 5);
  },
  isBlank: function(){
    return (!elem.pass.value && !elem.confPass.value);
  },
  isAlphaNumeric: function(){
    let isNumeric = elem.pass.value.match(/\d/) !== null || elem.confPass.value.match(/\d/) !== null;
    let isAlphabetical = elem.pass.value.match(/[a-z]/i) !== null || elem.confPass.value.match(/[a-z]/i) !== null

    return (isNumeric && isAlphabetical);
  },
  confPassHasNoValue: function(){
    return (elem.confPass.value.length == 0 && elem.pass.value.length > 0);
  }
};

var enableSubmitButton = function(outcome){
  if(outcome.matching && outcome.fiveLong && outcome.alphanumeric){
    document.getElementById("submitButton").disabled = false;
  } else {
    document.getElementById("submitButton").disabled = true;
  }
};

var updateMessages = function(outcome) {
  if (outcome.blank || passwords.confPassHasNoValue()){
    elem.notice.len.className = 'password-hide';
    elem.notice.reqchar.className = 'password-hide';
    elem.notice.match.className = 'password-hide';
  } else {
      if(outcome.fiveLong == false) {
        elem.notice.len.className = 'password-warning';
      } else {
        elem.notice.len.className = 'password-hide';
      }

      if(outcome.alphanumeric == false){
        elem.notice.reqchar.className = 'password-warning';
      } else {
        elem.notice.reqchar.className = 'password-hide';
      }

      if (outcome.matching == false){
        elem.notice.match.className = 'password-warning';
      } else {
        elem.notice.match.className = 'password-hide';
      }
  }
};

var outcome = {
  matching: false,
  fiveLong: false,
  alphanumeric: false,
  blank: true
};

function validateSignupPassword(e) {
  console.log("validateSignupPassword");

  var target = e.srcElement || e.target;

  outcome.matching = passwords.isMatching();
  outcome.fiveLong = passwords.isFiveCharsLong();
  outcome.alphanumeric = passwords.isAlphaNumeric();
  outcome.blank = passwords.isBlank();

  updateMessages(outcome);
  enableSubmitButton(outcome);
};

/**************************
 Forum make active on mouseover
**************************/
var makeActive = function(listId) {
  document.getElementById(listId.id).classList.add('active');
};

var makeInactive = function(listId) {
  document.getElementById(listId.id).classList.remove('active');
};
