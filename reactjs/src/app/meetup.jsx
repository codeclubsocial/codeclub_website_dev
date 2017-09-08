import React from 'react';
import ReactDOM from 'react-dom';
import './meetup.css';

async function getMeetup() {
  try {
    let response = await fetch('https://cors-anywhere.herokuapp.com/https://api.meetup.com/codeclub/events?key=674441542572b783949516b100104c&sign=true&photo-host=public&page=20');
    let data = await response.json();
    return data;
   } catch(error) {
    console.error(error);
  }
}

// async function requestToken() {
//   try {
//     let response = await fetch('https://cors-anywhere.herokuapp.com/https://api.meetup.com/oauth/request/', {
//       method: "POST",
//       body: JSON.stringify({
//         oauth_consumer_key: "kksoj0htpfk9ef9c5qcphj0glv",
//         oauth_signature_method: "PLAINTEXT",
//         oauth_signature: The signature as defined in Signing Requests.
//         oauth_timestamp: As defined in Nonce and Timestamp.
//         oauth_nonce: As defined in Nonce and Timestamp.
//         oauth_callback:
//       })
//     });
//     let data = await response.json();
//     return data;
//    } catch(error) {
//     console.error(error);
//   }
// }

async function postRSVP(eventID, access_token) {
  try {
    let response = await fetch('https://cors-anywhere.herokuapp.com/https://api.meetup.com/codeclub/events/' + eventID + '/rsvps?key=674441542572b783949516b100104c&sign=true&response=yes&photo-host=public&access_token='+access_token, {
      method: "POST"
    });
    let data = await response.json();
    return data;
   } catch(error) {
    console.error(error);
  }
}

class Meetup extends React.Component {
  constructor() {
    super();
    this.state = {
      meetupJson: {},
      meetupRSVP: {}
    }
    this.handleRSVPClick = this.handleRSVPClick.bind(this);
  }

  componentDidMount() {
    getMeetup().then((list) => {
      this.setState({meetupJson:list});
    });
  }

  handleRSVPClick() {
    console.log(window.location.hash);
    var eventID = this.state.meetupJson["0"]["id"];
    var access_token = window.location.hash.split(/&|=/)[1];
    console.log(access_token);
    postRSVP(access_token).then((list) => {
      this.setState({meetupRSVP:list});
    });
  }

  // handleLogInClick() {
  //   // requestToken().then((list) => {
  //   //   this.setState({meetupToken:list});
  //   // });
  //   var OAuth = require('@zalando/oauth2-client-js');
  //   var meetup = new OAuth.Provider({
  //     id: 'meetup',   // required
  //     authorization_url: 'https://secure.meetup.com/oauth2/authorize' // required
  //   });
  //   // Create a new request
  //   var request = new OAuth.Request({
  //       client_id: 'kksoj0htpfk9ef9c5qcphj0glv',  // required
  //       redirect_uri: 'http://austinsandbox.herokuapp.com/index'
  //   });
  //
  //   // Give it to the provider
  //   var uri = meetup.requestToken(request);
  //
  //   // Later we need to check if the response was expected
  //   // so save the request
  //   meetup.remember(request);
  //
  //   // Do the redirect
  //   window.location.href = uri;
  //
  //   var response = meetup.parse(window.location.hash);
  // }

  render() {
    if (Object.keys(this.state.meetupJson).length !== 0) {
      var date = new Date(this.state.meetupJson["0"]["time"]);
      var year = 1900 + date.getYear();
      var month = date.getMonth();
      var monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var day = date.getDate();
      var dayXX = ["st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "st"];
      var hours = date.getHours();
      var amPm = "AM";
      if (hours > 12) {
        hours = hours - 12;
        amPm = "PM";
      }
      var minutes = date.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      var name = this.state.meetupJson["0"]["venue"]["name"];
      return (
        <div>
          <p>The next scheduled meetup will be at {hours}:{minutes} {amPm} on {monthList[month]} {day}{dayXX[day-1]}, {year} at {name}.</p>
          {/* <form action="https://secure.meetup.com/oauth2/authorize?response_type=token&scope=rsvp&client_id=kksoj0htpfk9ef9c5qcphj0glv&redirect_uri=http://austinsandbox.herokuapp.com/index&state=h3kdj4">
            <input type="submit" value="Log in to Meetup-No Library" />
          </form> */}
          <a href="https://secure.meetup.com/oauth2/authorize?response_type=token&scope=rsvp&client_id=kksoj0htpfk9ef9c5qcphj0glv&redirect_uri=http://austinsandbox.herokuapp.com/index&state=h3kdj4" className="button">Log in to Meetup</a>
          <button onClick={this.handleRSVPClick}>RSVP</button>
        </div>
      );
    }
    return <p></p>;
  }



}


// ====================================

ReactDOM.render(
  <Meetup />,
  document.getElementById('root')
);
