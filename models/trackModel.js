const mongoose = require('mongoose');

// Define the user schema
const trackSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,

    },

    taskId: {
        type: String,
        required: true,

    },

    attendceId: {
        type: String,
        required: true,

    },

    userType: {
        type: String,
        required: true,

    },

    lat: {
        type: String,
        required: true,

    },


    long: {
        type: String,
        required: true,

    },

    status: {
        type: String,
        required: true,

    },

    createdAt: {
        type: Date,
        required: true,

    },


}, { versionKey: false });

// Create the asset model
const track = mongoose.model('track', trackSchema);

module.exports = track;
