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

class Meetup extends React.Component {
  constructor() {
    super();
    this.state = {
      meetupJson: {}
    }
  }

  componentDidMount() {
    getMeetup().then((list) => {
      this.setState({meetupJson:list});
    });
  }

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
      return (<p>The next scheduled meetup will be at {hours}:{minutes} {amPm} on {monthList[month]} {day}{dayXX[day-1]}, {year} at {name}.</p>);
    }
    return <p></p>;
  }



}


// ====================================

ReactDOM.render(
  <Meetup />,
  document.getElementById('root')
);
