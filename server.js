'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superaagent = require('superagent');

// Application Setup
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

// API Routes

app.get('/location', (request, response) => {
  try {
    const queryData = request.query.data;
    const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryData}&key=${process.env.GEOCODE_API_KEY}`;
    superaagent
      .get(geocodeURL)
      .end((error, googleMapsApiResponse) => {
        const location = new Location(queryData, googleMapsApiResponse.body);
        response.send(location);
      });
  }
  catch(error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong.');
  }
});

app.get('/weather', (request, response) => {
  try {
    const queryWeatherData = request.query.data;
    const weatherDataURL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${queryWeatherData.latitude},${queryWeatherData.longitude}`;
    superaagent
      .get(weatherDataURL)
      .end((error, darkSkyApiResponse) => {
        let weather = darkSkyApiResponse.body.daily.data.map(x => new Weather(x));
        response.send(weather);
      }) ;
  }
  catch(error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong.');
  }
});

app.get('/events', (request, response) => {
  try {
    const eventData = request.query.data;
    const eventDataURL = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${eventData.longitude}&${eventData.latitude}${process.env.EVENTBRITE_API_KEY}`;
    superaagent
      .get(eventDataURL)
      .set({Authorization: `Bearer ${process.env.EVENTBRITE_API_KEY}`})
      .end((error, eventBriteApiResponse) => {
        console.log(eventDataURL);
        // console.log(eventBriteApiResponse);
        let event = eventBriteApiResponse.body.daily.data.map(x => new Event(x));
        response.send(event);
      }) ;
  }
  catch(error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong.');
  }
});

// Helper Functions

function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address;
  this.latitude = res.results[0].geometry.location.lat;
  this.longitude = res.results[0].geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function Event(event) {
  this.link = event.link;
  this.name = event.name;
  this.event_date = new Date(event.time * 1000).toString().slice(0, 15);
  this.summary = event.summary;
}

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is up on ${PORT}`));
