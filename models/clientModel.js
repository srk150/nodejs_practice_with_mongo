const mongoose = require('mongoose');

// Define the user schema
const clientSchema = new mongoose.Schema({


    clientName: {
        type: String,
        required: true,
    },
    created: {
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
const client = mongoose.model('client', clientSchema);

module.exports = client;
