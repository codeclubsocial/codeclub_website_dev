import React from 'react';
import ReactDOM from 'react-dom';
import './meetup.css';

// for master:
// var consumerKey = 'ovcnv9ha9jar32damrf4nflcot';
// var redirectURI = 'http://www.codeclub.social/index';

// for dev:
// var consumerKey = '54ruujnlagioqjb2vnnevgvja9';
// var redirectURI = 'http://codeclubsocial.herokuapp.com/index';

// for austin:
var consumerKey = 'kksoj0htpfk9ef9c5qcphj0glv';
var redirectURI = 'http://austinsandbox.herokuapp.com/index';

async function getRSVP(eventID) {
  try {
    let response = await fetch('https://cors-anywhere.herokuapp.com/https://api.meetup.com/codeclub/events/' + eventID + '/rsvps?key=674441542572b783949516b100104c&sign=true&photo-host=public&page=20');
    let data = await response.json();
    return data;
   } catch(error) {
    console.error(error);
  }
}
async function getMeetup() {
  try {
    let response = await fetch('https://cors-anywhere.herokuapp.com/https://api.meetup.com/codeclub/events?key=674441542572b783949516b100104c&sign=true&photo-host=public&page=20');
    let data = await response.json();
    return data;
   } catch(error) {
    console.error(error);
  }
}

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

function makeState() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 15; i++)
  text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

class Meetup extends React.Component {
  constructor() {
    super();
    this.state = {
      meetupJson: {},
      meetupRSVP: {},
      getMeetupRSVP: {},
      urlState: makeState(),
      RSVPd: [],
      rsvpList: []
    }
    this.handleRSVPClick = this.handleRSVPClick.bind(this);
    this.doRSVP = this.doRSVP.bind(this);
    this.onLogIn = this.onLogIn.bind(this);
    this.handleLoggedInRSVPClick = this.handleLoggedInRSVPClick.bind(this);
  }

  componentDidMount() {
    getMeetup().then((list) => {
      this.setState({meetupJson:list});
      if (window.location.hash.length > 1) {
        var cookieState = document.cookie.split(/(urlStateCookie=)|;|(eventNum=)/);
        this.doRSVP(cookieState[3], cookieState[6]);
      }
    });
  }

componentDidUpdate() {
  if (Object.keys(this.state.meetupRSVP).length !== 0 && Object.keys(this.state.getMeetupRSVP).length !== 0) {
    var rsvpList = [];
    for (var k in this.state.getMeetupRSVP) {
      rsvpList.push(this.state.getMeetupRSVP[k]["member"]["id"]);
    }
    for (let i = 0; i < rsvpList.length; i++) {
      if (rsvpList[i] !== this.state.rsvpList) {
        this.setState({rsvpList: rsvpList});
        break;
      }
    }
    this.setState({rsvpList: rsvpList});
    console.log("rsvpList = " + this.state.rsvpList);
    let arrCookie = document.cookie.split(/(urlStateCookie=)|;|(eventNum=)/);
    let eventNum = arrCookie[6];
    console.log("eventNum =" + eventNum);
    if (!this.state.RSVPd.includes(eventNum)) {
      var RSVPd = this.state.RSVPd.slice();
      RSVPd.push(eventNum);
      this.setState({RSVPd: RSVPd});
    }
    console.log("RSVPd = " + this.state.RSVPd);
  }
}

  doRSVP(cookieState, eventNum) {
    var eventID = this.state.meetupJson[eventNum]["id"];
    var fragments = window.location.hash.split(/&|=/)
    var access_token = fragments[1];
    if (fragments[9] == cookieState) {
      postRSVP(eventID, access_token).then((list) => {
        this.setState({meetupRSVP:list});
      });
    }
    getRSVP(eventID).then((list) => {
      this.setState({rsvpList:[]});
      this.setState({getMeetupRSVP:list});
    });
  }

  handleRSVPClick(eventNum) {
    if (window.location.hash.length <= 1) {
      return "https://secure.meetup.com/oauth2/authorize?response_type=token&scope=rsvp&client_id=" + consumerKey + "&redirect_uri=" + redirectURI + "&state=" + this.state.urlState;
    }
  }

  handleLoggedInRSVPClick(eventNum) {
    if (Object.keys(this.state.meetupJson).length !== 0) {
      this.onLogIn(eventNum);
      if (window.location.hash.length <= 1) {
        return true;
      }
      var cookieState = document.cookie.split(/(urlStateCookie=)|;|(eventNum=)/);
      this.doRSVP(cookieState[2], eventNum);
    }
    return false;
  }

// Stores randomly generated state in cookie to be checked when user comes back from meetup auth site
  onLogIn(eventNum) {
    var d = new Date();
    // number of days until cookie expires
    var ndays = 1;
    d.setTime(d.getTime() + (ndays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    var newCookie = "urlStateCookie=" + this.state.urlState + ";" + expires + ";path=/";
    document.cookie = newCookie;
    document.cookie += "eventNum=" + eventNum + ";" + expires + ";path=/"
  }

  render() {
    if (Object.keys(this.state.meetupJson).length !== 0) {
      var cardStyle = {
        width: "20rem",
      };
      var multiCardJSX = [];
      for (let i = 0; i < 3; i++) {
        var finalJSX = [];
        var date = new Date(this.state.meetupJson[i]["time"]);
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
        var name = this.state.meetupJson[i]["venue"]["name"];
        finalJSX.push(
          <div>
            <h4 className="card-title">{this.state.meetupJson[i]["name"]}</h4>
            <p className="card-text">{hours}:{minutes} {amPm} on {monthList[month]} {day}{dayXX[day-1]}, {year}<span><br/></span>{name}</p>
            <a href={this.handleRSVPClick(i)} onClick={() => this.handleLoggedInRSVPClick(i)} className="button card-link">RSVP</a>
          </div>
        );
        var cookieState = document.cookie.split(/(urlStateCookie=)|;|(eventNum=)/);
        if (Object.keys(this.state.meetupRSVP).length !== 0 && Object.keys(this.state.getMeetupRSVP).length !== 0) {
          if (this.state.rsvpList.includes(this.state.meetupRSVP["member"]["id"]) && this.state.RSVPd.includes(i)) {
            finalJSX.push(<p className="card-text"><span><br/></span>You RSVP'd!</p>);
          }
        }
        multiCardJSX.push(
          <div>
            <div className="card" style={cardStyle}>
              <div className="card-body">
                {finalJSX}
              </div>
            </div>
            <span><br/></span>
          </div>
        );
      }


      return (
        <div>
          {multiCardJSX}
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
