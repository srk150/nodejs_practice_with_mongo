const mongoose = require('mongoose');

// Define the user schema
const attendanceSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true,
  },
  inDate: {
    type: Date,
    required: true,
  },

  outDate: {
    type: Date,
    default: 'Null',

  },

  locationIn: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },

  locationOut: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },

  status: {
    type: String,
    enum: ['IN', 'OUT'],
    default: 'IN',
  },
}, { versionKey: false });

// Create the User model
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
