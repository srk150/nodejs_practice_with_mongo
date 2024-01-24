const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Define your all attendance route
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/list/:userId', attendanceController.allAttendece);
router.post('/distance', attendanceController.getDuration);
module.exports = router;
