
var currentURL = window.location.href;
var currentURLArr = currentURL.split('/');
var currentID = currentURLArr[currentURLArr.length - 1];
var msg;
fetch('/getdate/'+ currentID)
  .then(res => res.json())
  .then(function(msg) {
    console.log(msg);
    var commentsArr = msg[0].comments;
    for (var i = 0; i < commentsArr.length; i++) {
      var fullDate = new Date(commentsArr[i].dateCreated);
      var month = fullDate.getMonth() + 1;
      var date = fullDate.getDate();
      var year = fullDate.getYear() + 1900;
      var amPM = "AM";
      var hours = fullDate.getHours();
      if (hours > 12) {
        amPM = "PM";
        hours -= 12;
      }
      var minutes = fullDate.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      var seconds = fullDate.getSeconds();
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      var dateStr = month + '/' + date + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + amPM;
      var commentID = "msgcomments" + i;
      console.log(commentID);
      $('#' + commentID).html(dateStr);
    }
  });
