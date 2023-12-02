const validator   = require('validator');


async function isValidEmail(email) {
  return validator.isEmail(email);
}

async function isValidMobile(mobile) {
  return validator.isNumeric(mobile) && validator.isLength(mobile, { min: 10, max: 10 });
}

async function isValidPassword(password) {
  return validator.isLength(password, { min: 5 });
}

async function generateOTP() {

  const otpLength = 4;
  const min = Math.pow(10, otpLength - 1);
  const max = Math.pow(10, otpLength) - 1;

  // Generate a random 4-digit number
  const otpCode = Math.floor(Math.random() * (max - min + 1)) + min;

  return otpCode.toString();  
}

module.exports = { hashPassword, comparePasswords, isValidEmail, isValidMobile, isValidPassword, generateOTP  };
