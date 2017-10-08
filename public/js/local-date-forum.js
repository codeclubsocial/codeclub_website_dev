var currentURL = window.location.href;
var currentURLArr = currentURL.split('/');
var currentID = currentURLArr[currentURLArr.length - 1];
var msg;
fetch('/getdate/forum')
  .then(res => res.json())
  .then(function(msg) {
    msg = msg.sort(function(a, b){
      var aDate = new Date(a.dateCreated);
      var bDate = new Date(b.dateCreated);
      var keyA = aDate.getTime();
      var keyB = bDate.getTime();
      if(keyA > keyB) return -1;
      if(keyA < keyB) return 1;
      return 0;
    });
    for (var i = 0; i < msg.length; i++) {
      var fullDate = new Date(msg[i].dateCreated);
      var month = fullDate.getMonth() + 1;
      var date = fullDate.getDate();
      var year = fullDate.getYear() + 1900;
      var amPM = "AM";
      var hours = fullDate.getHours();
      if (hours > 12) {
        amPM = "PM";
        hours -= 12;
      }
      else if (hours === 12) {
        amPM = "PM";
      }
      else if (hours === 0) {
        hours = 12;
      }
      var minutes = fullDate.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      var dateStr = month + '/' + date + '/' + year + ' ' + hours + ':' + minutes + ' ' + amPM;
      var postID = "msg" + i;
      $('#' + postID).html(dateStr);
    }
  });
