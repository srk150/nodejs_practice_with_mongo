const mongoose = require('mongoose');

// Define the reimbrushSchema
const reimbrushSchema = new mongoose.Schema({

    vendorId: {
        type: String,
        default: '',

    },

    userId: {
        type: String,
        default: '',
      },

    reimbDate: {
        type: String,
        default: '',

    },

    reimbType: {
        type: String,
        required: true,

    },

    notes: {
        type: String,
        default: '',
    },

    amount: {
        type: String,
        required: true,
    },


    reimbrushmentDocument: {
        type: String,
        default: '',
    },

    createdAt: {
        type: String,
        default: '',
    },

    type: {
        type: String,
        default: '',

    },

    createdBy: {
        type: String,
        default: '',

    },

    status: {
        type: String,
        enum: ['1', '0'],
        default: '0',
    },
}, { versionKey: false });

// Create the reimbrushment model
const reimbrushment = mongoose.model('reimbrushment', reimbrushSchema);

module.exports = reimbrushment;
