const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({


  fullname: {
    type: String,

  },


  mobile: {
    type: String,
    required: true,

  },


  userType: {
    type: String,
    required: true,

  },

  machineNumber: {
    type: String,
    required: true,

  },

  workLocation: {
    type: String,
    required: true,

  },

  otp: {
    type: String,
    default: 'null',
  },
  status: {
    type: String,
    enum: ['1', '0'], // Assuming status can be 'active : 1' or 'inactive : 0'
    default: '0', // Default status is 'active : 1'
  },
}, { versionKey: false });

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
