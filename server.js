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

    // console.log('geoData is', geocodingURL);
  }
  catch(error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong.');
  }
});

app.get('/weather', (request, response) => {
  try {
    const queryWeatherData = request.query.data;
    const weatherData = getWeather(queryWeatherData);
    response.send(weatherData);
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

function getWeather(request) {
  const weatherURL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.latitude},${request.longitude}`;
  console.log(weatherURL);
  // const darkskyData = require('./data/darksky.json');


  

  return weatherURL.daily.data.map(x => new Weather(x));
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is up on ${PORT}`));
