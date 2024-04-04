const mongoose = require('mongoose');

// Define the user schema
const taskSchema = new mongoose.Schema({

  vendorId: {
    type: String,
    default: '',

  },

  userId: {
    type: String,
    default: '',
  },
  clientId: {
    type: String,
    default: '',
  },

  clientName: {
    type: String,
    default: '',
  },

  clientEmail: {
    type: String,
    default: '',
  },


  clientMobile: {
    type: String,
  },

  empName: {
    type: String,

  },


  taskName: {
    type: String,
    required: true,
  },

  taskDate: {
    type: Date,
    default: '',
  },

  taskEndDate: {
    type: Date,
    default: '',
  },

  address: {
    type: String,
    default: '',
  },

  created: {
    type: String,
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
      default: '0',
    },
    coordinates: {
      type: [Number],
      default: '0',
    },
  },

  taskAddress: {
    type: String,
    default: '',
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
