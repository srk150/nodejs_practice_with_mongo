const mongoose = require('mongoose');

// Define the user schema
const assetsSchema = new mongoose.Schema({

    vendorId: {
        type: String,
        required: true,

    },

    assetName: {
        type: String,
        required: true,

    },

    vendorName: {
        type: String,
        required: true,

    },

    model: {
        type: String,
        required: true,
    },

    mobileNumber: {
        type: String,
        required: true,
    },

    lastServiceDate: {
        type: String,
        required: true,
    },

    nextServiceDate: {
        type: String,
        required: true,
    },


    assetsDocument: {
        type: String,
        default: '',
    },

    status: {
        type: String,
        enum: ['1', '0'],
        default: '0',
    },
}, { versionKey: false });

// Create the asset model
const asset = mongoose.model('asset', assetsSchema);

module.exports = asset;
