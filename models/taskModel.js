const mongoose = require('mongoose');

// Define the user schema
const taskSchema = new mongoose.Schema({

  vendorId: {
    type: String,

  },

  userId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },

  clientName: {
    type: String,
    required: true,
  },

  taskName: {
    type: String,
    required: true,
  },

  taskDate: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  created: {
    type: Date,
    required: true,
  },

  createdBy: {
    type: String,
    default: '',
  },

  type: {
    type: String,
    default: '',

  },

  taskDocument: {
    type: String,
    default: '',
  },

  documentNotes: {
    type: String,
    default: '',
  },


  taskNotes: {
    type: String,
    default: '',
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
    enum: ['1', '0'],
    default: '0',
  },
}, { versionKey: false });

// Create the User model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
