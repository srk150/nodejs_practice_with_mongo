const cron = require('node-cron');
const axios = require('axios');

const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

const baseUrl = process.env.BASE_URL;
const endpointPath = '/api/attendance/autolog';
// Define the task to be executed
const task = async () => {
    try {
        // Make the API GET request
        const response = await axios.get(baseUrl + endpointPath);
        console.log('API request successful:', response.data);
    } catch (error) {
        console.error('Error making API request:', error);
    }
};

// Schedule the attendance for auto logout to run at 11:59 every day
cron.schedule('59 23 * * *', task);
console.log('Attendance for auto logout to run at 11:59 every day.');
