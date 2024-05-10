const attendanceModel = require('../models/attendanceModel');
const vendorModel = require('../models/vendorModel');
const employeeModel = require('../models/employeeModel');
const trackModel = require('../models/trackModel');

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

      //for even odd condition
      // const userStatusCount = await attendanceModel.countDocuments({ userId });
      // let status = "IN";
      // if (userStatusCount % 2 === 1) {
      //   status = "OUT";
      // }

      const userStatusCount = await attendanceModel.findOne({ userId: userId, createdAt: createdAt }).sort({ _id: -1 }).exec();

      let status = '';

      if (userStatusCount === null) {

        status = "IN";

      } else {

        if (userStatusCount.status == 'IN') {

          status = "OUT";

        } else {

          status = "IN";

        }
      }

      const agoDate = new Date().toISOString();

      if (type == 'vendor') {

        const filter = { _id: userId };
        const updateDoc = {
          $set: {
            agoDate: agoDate,
            attendanceStatus: status,
            vandorLat: lat,
            vandorLong: long

          }
        };

        const result = await vendorModel.updateOne(filter, updateDoc);

      } else {


        const filter = { _id: userId };
        const updateDoc = {
          $set: {
            agoDate: agoDate,
            attendanceStatus: status,
            latitude: lat,
            longitude: long
          }
        };

        const result = await employeeModel.updateOne(filter, updateDoc);


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

      const savedAttendance = await newAttendance.save();
      const insertedId = savedAttendance._id;

      //track log inser here
      const newTrack = new trackModel({
        userId,
        userType: type,
        status,
        taskId: 0,
        lat: lat,
        long: long,
        attendceId: insertedId,
        createdAt: currentDate,
      })
      await newTrack.save();
      // end track log

      res.status(200).json({ message: 'Attendance ' + status + ' Successfully' });

    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },


  //autolog
  autologOut: async (req, res) => {
    try {

      const { userId, type } = req.body;

      // Check if any one empty
      if (!userId || !type) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }

      const myDate = new Date();

      const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
      const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');
      const createdAt = currentDateIST.format('YYYY-MM-DD');

      const agoDate = new Date().toISOString();

      const userAttendence = await attendanceModel.findOne({ userId: userId, createdAt: createdAt }).sort({ _id: -1 }).exec();

      if (userAttendence.status == "IN") {


        // check if date time before 11.59
        const currentDatefor = new Date();
        const currentHour = currentDatefor.getHours(); // Get the current hour (0-23)
        const currentMinute = currentDatefor.getMinutes(); // Get the current minute (0-59)

        // Check if the current time is 11:59 PM
        if (currentHour === 23 && currentMinute === 59) {


          let status = "OUT";

          if (type == 'vendor') {

            const filter = { _id: userId };
            const updateDoc = {
              $set: {
                agoDate: agoDate,
                attendanceStatus: status,
                vandorLat: 0,
                vandorLong: 0

              }
            };

            const result = await vendorModel.updateOne(filter, updateDoc);

          } else {


            const filter = { _id: userId };
            const updateDoc = {
              $set: {
                agoDate: agoDate,
                attendanceStatus: status,
                latitude: 0,
                longitude: 0
              }
            };

            const result = await employeeModel.updateOne(filter, updateDoc);


          }


          const newAttendance = new attendanceModel({
            userId,
            type,
            attnedanceDate: currentDate,
            attnedanceLat: 0,
            attnedanceLong: 0,
            attnedanceAddress: "0",
            status,
            createdAt: createdAt,
          });

          const savedAttendance = await newAttendance.save();
          const insertedId = savedAttendance._id;

          //track log inser here
          const newTrack = new trackModel({
            userId,
            userType: type,
            status,
            taskId: 0,
            lat: 0,
            long: 0,
            attendceId: insertedId,
            createdAt: currentDate,
          })
          await newTrack.save();
          // end track log

          res.status(200).json({ message: 'Attendance Auto Logout Successfully' });

        } else {

          res.status(500).json({ error: 'Befor 11:59, You can not auto logout' });

        }

      } else {

        res.status(500).json({ error: 'Already Check Out' });

      }
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },


};
//module.exports end






