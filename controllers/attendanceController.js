const attendanceModel = require('../models/attendanceModel');
const axios = require('axios');

module.exports = {
  //For attendance in api

  checkIn: async (req, res) => {
    try {
      const { userId, lat, long } = req.body;

      // Check if an active attendance record already exists for the user and current date
      const currentDate = new Date();
      const existingAttendance = await attendanceModel.findOne({
        userId,
        status: "IN",
        inDate: {
          $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
          $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1),
        },
        outDate: null,
      });

      if (existingAttendance) {
        return res.status(400).json({ message: 'User already checked in for the day' });
      }

      // Proceed with the check-in process
      const newAttendance = new attendanceModel({
        userId,
        inDate: currentDate,
        outDate: null,
        locationIn: {
          type: 'Point',
          coordinates: [parseFloat(lat), parseFloat(long)],
        },
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
      const { userId, lat, long } = req.body;

      // Check if an active attendance record already exists for the user and current date
      const currentDate = new Date();
      const existingAttendance = await attendanceModel.findOne({
        userId,
        inDate: {
          $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
          $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1),
        },
        outDate: null,
      });

      if (!existingAttendance) {
        return res.status(400).json({ message: 'User already checked out for the day!' });
      }

      // Proceed with the check-out process
      const result = await attendanceModel.updateOne(
        { userId, outDate: null }, // Find the document with the given userId and a missing outDate
        {
          $set: {
            outDate: new Date(),
            status: "OUT",
            locationOut: {
              type: 'Point',
              coordinates: [parseFloat(lat), parseFloat(long)],
            },
          },
        }
      );

      if (result.modifiedCount === 1) {
        res.status(200).json({ message: 'Attendance checked-out successfully' });
      } else {
        res.status(402).json({ message: 'Error in updating attendance' });
      }

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
      const attendance = await attendanceModel.find({ userId: userId });

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

};
//module.exports end






