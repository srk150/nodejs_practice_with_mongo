const cron = require('node-cron');
const attendanceController = require('./controllers/attendanceController');

// Schedule the cron job to run at 5:00 PM every day
cron.schedule('25 17 * * *', async () => {
    try {
        await attendanceController.autologOut(); // Call your autologOut function
        console.log('Attendance Auto Logout cron job ran successfully at 5:00 PM.');
    } catch (error) {
        console.error('Error running Attendance Auto Logout cron job:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Adjust timezone as per your requirement
});
