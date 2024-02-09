const mongoose = require('mongoose');

// Define the reimbrushSchema
const reimbrushSchema = new mongoose.Schema({

    vendorId: {
        type: String,
        required: true,

    },

    reimbDate: {
        type: String,
        required: true,

    },

    reimbType: {
        type: String,
        required: true,

    },

    notes: {
        type: String,
        required: true,
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
        required: true,
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
