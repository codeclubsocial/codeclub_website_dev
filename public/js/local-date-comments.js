
var currentURL = window.location.href;
var currentURLArr = currentURL.split('/');
var currentID = currentURLArr[currentURLArr.length - 1];
var msg;
fetch('/getdate/'+ currentID)
  .then(res => res.json())
  .then(function(msg) {
    var commentsArr = msg[0].comments;
    var postDateCreated = new Date(msg[0].dateCreated);
    $('#post-date-created').html(postDateCreated.toDateString());
    for (var i = 0; i < commentsArr.length; i++) {
      var fullDate = new Date(commentsArr[i].dateCreated);
      var month = fullDate.getMonth() + 1;
      var date = fullDate.getDate();
      var year = fullDate.getYear() + 1900;
      var amPM = "AM";
      var hours = fullDate.getHours();
      if (hours > 11) {
        amPM = "PM";
        hours -= 12;
      }
      else if (hours === 0) {
        hours = 12;
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
      $('#' + commentID).html(dateStr);
    }
  });
