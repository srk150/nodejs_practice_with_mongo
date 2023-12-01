const attendanceModel = require('../models/attendanceModel');

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
            location: {
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
            location: {
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
  

};
//module.exports end



  


