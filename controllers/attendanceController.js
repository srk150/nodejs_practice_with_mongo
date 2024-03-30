const attendanceModel = require('../models/attendanceModel');
const axios = require('axios');
// const moment = require('moment');
const moment = require('moment-timezone');

const userService = require('../services/userService');

module.exports = {
  //For attendance in api

  checkIn: async (req, res) => {
    try {
      const { userId, lat, long, type } = req.body;


      // Check if any one empty
      if (!userId || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }


      const myDate = new Date();
      const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
      const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');
      const createdAt = currentDateIST.format('YYYY-MM-DD');


      const locationGet = await userService.getLocation(lat, long);
      // console.log(locationGet);
      // Proceed with the check-in process
      const newAttendance = new attendanceModel({
        userId,
        type,
        attnedanceDate: currentDate,
        attnedanceLat: lat,
        attnedanceLong: long,
        attnedanceAddress: locationGet,
        createdAt: createdAt,
      });

      await newAttendance.save();

      res.status(200).json({ message: 'Attendance checked in successfully' });
    } catch (error) {
      console.error('Error recording attendance:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },



  //For attendance out api
  checkOut: async (req, res) => {
    try {

      const { userId, lat, long, type } = req.body;

      // Check if any one empty
      if (!userId || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }


      const myDate = new Date();
      const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
      const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');
      const createdAt = currentDateIST.format('YYYY-MM-DD');

      const locationGet = await userService.getLocation(lat, long);

      // Proceed with the check-in process
      const newAttendance = new attendanceModel({
        userId,
        type,
        attnedanceDate: currentDate,
        attnedanceLat: lat,
        attnedanceLong: long,
        attnedanceAddress: locationGet,
        status: "OUT",
        createdAt: createdAt,
      });
       
      await newAttendance.save();

      res.status(200).json({ message: 'Attendance checked out successfully' });

    } catch (error) {
      console.error('Error checking out attendance:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // all Attendece list 
  allAttendece: async (req, res) => {

    try {

      const { userId } = req.params;

      // Find the user by ID
      const attendance = await attendanceModel.find({ userId: userId }).sort({ attnedanceDate: 1 });

      if (!attendance) {
        return res.status(404).json({ error: 'Not Found', message: 'Attendance record not found for the given user ID' });
      }

      res.status(200).json(attendance);
    } catch (error) {
      console.error('Error fetching attendance by ID:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }

  },



  //get distance and duration 
  getDuration: async (req, res) => {

    const apiKey = process.env.GMAPAPI;
    const origin = req.body.origin;
    const destination = req.body.destination;

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`
      );

      // console.log(response);

      const distance = response.data.rows[0].elements[0].distance.text;
      const duration = response.data.rows[0].elements[0].duration.text;

      res.json({ distance, duration });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }


  },


  attendanceInOut: async (req, res) => {
    try {

      const { userId, lat, long, type } = req.body;

      // Check if any one empty
      if (!userId || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }

      const myDate = new Date();
      const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
      const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');
      const createdAt = currentDateIST.format('YYYY-MM-DD');

      const userStatusCount = await attendanceModel.countDocuments({ userId });

      let status = "IN"; // Default status is IN

      // If the user has odd status count, set status to OUT
      if (userStatusCount % 2 === 1) {
        status = "OUT";
      }

      const newAttendance = new attendanceModel({
        userId,
        type,
        attnedanceDate: currentDate,
        attnedanceLat: lat,
        attnedanceLong: long,
        attnedanceAddress: "0",
        status,
        createdAt: createdAt,
      });

      await newAttendance.save();

      res.status(200).json({ message: 'Attendance added successfully' });

    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },


};
//module.exports end






