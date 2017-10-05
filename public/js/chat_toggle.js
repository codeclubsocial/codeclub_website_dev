function toggleDisplay(){
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
