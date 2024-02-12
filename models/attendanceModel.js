const mongoose = require('mongoose');

// Define the user schema
const attendanceSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  attnedanceDate: {
    type: String,
    required: true,
  },

  attnedanceLat: {
    type: String,
    required: true,
  },

  attnedanceLong: {
    type: String,
    required: true,
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
