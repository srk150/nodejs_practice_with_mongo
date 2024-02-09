const mongoose = require('mongoose');

// Define the user schema
const vendorSchema = new mongoose.Schema({

    vendorName: {
        type: String,
        default: '',
    },
    vendorEmail: {
        type: String,
        default: '',
    },
    vendorMobile: {
        type: String,
        required: true,
    },

    vendorCompany: {
        type: String,
        default: '',
    },

    vandorLat: {
        type: String,
        default: '',
    },

    vandorLong: {
        type: String,
        default: '',
    },

    vandorOtp: {
        type: String,
        default: '',
    },

    vandorCreated: {
        type: Date,
        required: true,
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { versionKey: false });

// Create the User model
const vendor = mongoose.model('vendor', vendorSchema);

module.exports = vendor;