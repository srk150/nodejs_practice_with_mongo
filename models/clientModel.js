const mongoose = require('mongoose');

// Define the user schema
const clientSchema = new mongoose.Schema({

    vendorId: {
        type: String,

    },

    clientFullName: {
        type: String,
        required: true,
    },
    clientEmail: {
        type: String,
        required: true,
    },
    clientMobile: {
        type: String,
        required: true,
    },

    clientCompany: {
        type: String,
        required: true,
    },

    clientAddress: {
        type: String,
        required: true,
    },

    clientCity: {
        type: String,
        required: true,
    },

    clientState: {
        type: String,
        required: true,
    },

    clientCountry: {
        type: String,
        required: true,
    },


    clientZip: {
        type: String,
        required: true,
    },

    clientDocument: {
        type: String,
        default: '',
    },

    createdBy: {
        type: String,
        default: '',
    },

    type: {
        type: String,
        default: '',

    },

    created: {
        type: String,
        required: true,
    },

    clientLocation: {
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
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { versionKey: false });

// Create the User model
const client = mongoose.model('client', clientSchema);

module.exports = client;
