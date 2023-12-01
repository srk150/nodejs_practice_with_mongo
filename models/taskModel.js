const mongoose = require('mongoose');

// Define the user schema
const taskSchema = new mongoose.Schema({
 
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
  },

  location: {
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
  status: {
    type: String,
    enum: ['IN', 'OUT'], 
    default: 'IN', 
  },
}, { versionKey: false });

// Create the User model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
