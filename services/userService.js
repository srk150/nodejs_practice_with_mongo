const validator = require('validator');
const axios = require('axios');

async function isValidEmail(email) {
  return validator.isEmail(email);
}

async function isValidMobile(mobile) {
  return validator.isNumeric(mobile) && validator.isLength(mobile, { min: 10, max: 10 });
}

async function isValidPassword(password) {
  return validator.isLength(password, { min: 5 });
}

async function parseCoordinates(coordinates) {
  const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
  return { lat, lng };
}


async function generateOTP() {

  const otpLength = 4;
  const min = Math.pow(10, otpLength - 1);
  const max = Math.pow(10, otpLength) - 1;

  // Generate a random 4-digit number
  const otpCode = Math.floor(Math.random() * (max - min + 1)) + min;

  return otpCode.toString();
}


// distanceMiddleware.js
async function calculateDistanceAndDuration(originCoords, destinationCoords) {

  const apiKey = process.env.GMAPAPI;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: `${originCoords.lat},${originCoords.lng}`,
        destinations: `${destinationCoords.lat},${destinationCoords.lng}`,
        key: apiKey,
      },
    });

    return response;

  } catch (error) {
    console.error('Error fetching distance and duration:', error.message);
  }
}


async function getLocation(lat, long) {
  const apiKey = process.env.GMAPAPI;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${long}`,
        key: apiKey,
      },
    });

    // Extract the formatted address from the response
    const formattedAddress = response.data.results[0].formatted_address;

    return formattedAddress;

  } catch (error) {
    console.error('Error fetching address:', error.message);
    throw error; // Re-throw the error to be handled by the caller
  }

}




module.exports = { isValidEmail, isValidMobile, isValidPassword, generateOTP, calculateDistanceAndDuration, parseCoordinates, getLocation };




