const mongoose = require('mongoose');

// Define the user schema
const taskSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },

  taskDesc: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
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
    enum: ['Done', 'Not Done'],
    default: 'Not Done',
  },
}, { versionKey: false });

// Create the User model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
