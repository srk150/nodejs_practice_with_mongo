const mongoose = require('mongoose');

// Define the user schema
const empSchema = new mongoose.Schema({


    vendorId: {
        type: String,

    },

    fullname: {
        type: String,

    },


    mobile: {
        type: String,
        required: true,

    },


    userType: {
        type: String,
        required: true,

    },

    machineNumber: {
        type: String,
        required: true,

    },

    workLocation: {
        type: String,
        required: true,

    },

    otp: {
        type: String,
        default: 'null',
    },


    latitude: {
        type: String,
        default: '',
    },

    longitude: {
        type: String,
        default: '',
    },


    status: {
        type: String,
        enum: ['1', '0'], // Assuming status can be 'active : 1' or 'inactive : 0'
        default: '1', // Default status is 'active : 1'
    },
}, { versionKey: false });

// Create the User model
const Employee = mongoose.model('Employee', empSchema);
module.exports = Employee;
