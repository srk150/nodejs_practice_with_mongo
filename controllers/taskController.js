const taskModel = require('../models/taskModel');
const userService = require('../services/userService');
const employeeModel = require('../models/employeeModel');
const vendorModel = require('../models/vendorModel');
const clientModel = require('../models/clientModel');
const trackModel = require('../models/trackModel');


const axios = require('axios');
const YOUR_GOOGLE_MAPS_API_KEY = process.env.GMAPAPI;

const multer = require('multer');
const path = require('path');

const moment = require('moment-timezone');

const { exit } = require('process');


const ObjectId = require('mongoose').Types.ObjectId;


// Storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/taskDoc");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage }).single("taskDocument");



module.exports = {
  //For attendance in api

  createTask: async (req, res) => {
    try {


      // Handle file upload using multer middleware
      upload(req, res, async function (err) {

        // upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          console.error(err);
          res.status(500).json({ error: "An error occurred during file upload." });
        } else if (err) {
          // An unknown error occurred when uploading.
          console.error(err);
          res.status(500).json({ error: "An unknown error occurred during file upload." });
        }

        const { userId, clientId, taskName, taskDate, address, lat, long, vendorId, type } = req.body;

        // task name, 

        // Check if any of the properties is empty or falsy
        // if (!userId || !clientId || !clientName || !taskName || !taskDate || !address || !lat || !long || !vendorId || !type) {
        //   return res.status(400).json({ error: 'One or more fields are empty' });
        // }

        if (!userId || !taskName) {
          return res.status(400).json({ error: 'Task description is empty' });
        }

        // Check if file was provided
        let uploadedFile = '';

        if (!req.file) {

          uploadedFile = '';

        } else {

          //uploadedFile = process.env.BASE_URL + "/" + req.file.path.replace(/\\/g, "/");
          uploadedFile = "taskDoc/" + req.file.filename;

        }


        // check sendor admin or employee
        let createdBy = '';
        let empName = '';
        if (type == "vendor") {

          const vendorExisting = await vendorModel.findById({ _id: vendorId });

          createdBy = vendorExisting.vendorName;
          empName = vendorExisting.vendorName
        } else {

          const objectId = new ObjectId(vendorId);
          const empExisting = await employeeModel.findOne({ _id: objectId });
          if (empExisting) {

            createdBy = empExisting.fullname;
          }



        }

        const empextes = await employeeModel.findById({ _id: userId });

        if (type == "vendor" && empextes) {
          empName = empextes.fullname;

        } else {

          empName = createdBy;

        }

        //get client mobile
        let clientMobile = '';
        let clientName = '';
        let clientEmail = '';
        if (clientId) {
          const clientExists = await clientModel.findById(clientId);

          if (clientExists) {
            clientMobile = clientExists.clientMobile;
            clientName = clientExists.clientFullName;
            clientEmail = clientExists.clientEmail;

          } else {
            clientMobile = "";
            clientName = "";
            clientEmail = "";
          }
        } else {
          clientMobile = "";
          clientName = "";
          clientEmail = "";
        }

        const myDate = new Date();
        const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
        const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');


        const newTask = new taskModel({
          userId,
          clientId,
          clientName,
          clientEmail,
          empName: empName,
          clientMobile: clientMobile,
          taskName,
          taskDate,
          address,
          type,
          createdBy,
          created: currentDate,
          taskDocument: uploadedFile,
          vendorId: vendorId,
          location: {
            type: 'Point',
            coordinates: [parseFloat(lat), parseFloat(long)],
          },
        });

        await newTask.save();

        res.status(201).json({ message: 'Task created successfully' });

      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error in creating task' });
    }


  },



  //For tasklist for admin api
  taskList: async (req, res) => {

    try {

      const { vendorId } = req.params;

      const { status, taskDate } = req.query;

      // Fetching employees with the given vendorId
      const employees = await employeeModel.find({ vendorId: vendorId });
      const employeeIds = employees.map(employee => employee._id);


      let query = { vendorId: { $in: [vendorId, ...employeeIds] } };

      if (taskDate) {
        const startDate = new Date(taskDate);
        startDate.setUTCHours(0, 0, 0, 0); // Set to the start of the day
        const endDate = new Date(taskDate);
        endDate.setUTCHours(23, 59, 59, 999); // Set to the end of the day

        query.taskDate = {
          $gte: startDate,
          $lt: endDate
        };
      }


      // Add status filter if provided
      if (status !== undefined && (status === '0' || status === '1')) {
        query.status = status;
      }

      const taskList = await taskModel.find(query, '-taskAddress').sort({ taskDate: 1 });


      if (!taskList || taskList.length === 0) {
        // If task list is empty or not found
        return res.status(404).json({ tasks: [] });
      } else {
        // If tasks are found

        // Format taskDate before sending the response
        const formattedTaskList = taskList.map(task => ({
          ...task.toObject(),
          taskDate: moment(task.taskDate).format('YYYY-MM-DD hh:mm A'),
          taskEndDate: moment(task.taskEndDate).format('YYYY-MM-DD hh:mm A')
        }));

        // If tasks are found
        return res.status(200).json({ tasks: formattedTaskList });


        // return res.status(200).json({ tasks: taskList });
      }

    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  },

  //task Edit
  taskEdit: async (req, res) => {

    try {

      const { taskID } = req.params;

      // Find the task by ID
      const taskGet = await taskModel.findById(taskID, '-taskAddress');

      if (!taskGet) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json(taskGet);


    } catch (error) {
      console.error('Error for update the task:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }


  },


  //task Details By Employee id under working

  taskListByEmp: async (req, res) => {

    try {

      const { empId } = req.params;
      const { status, taskDate } = req.query;


      // Find the task by ID
      // const taskGet = await taskModel.find({ userId: empId });
      const query = { userId: empId };


      if (taskDate) {
        const startDate = new Date(taskDate);
        startDate.setUTCHours(0, 0, 0, 0); // Set to the start of the day
        const endDate = new Date(taskDate);
        endDate.setUTCHours(23, 59, 59, 999); // Set to the end of the day

        query.taskDate = {
          $gte: startDate,
          $lt: endDate
        };
      }


      if (status !== undefined && (status === '0' || status === '1')) {
        query.status = status;
      }

      // const tasks = await taskModel.find(query);

      const tasks = await taskModel.find(query, '-taskAddress').sort({ taskDate: 1 });


      if (!tasks || tasks.length === 0) {
        // If task list is empty or not found
        return res.status(404).json({ tasks: [] });

      } else {

        // Format taskDate before sending the response
        const formattedTaskList = tasks.map(task => ({
          ...task.toObject(),
          taskDate: moment(task.taskDate).format('YYYY-MM-DD hh:mm A')
        }));

        // If tasks are found
        return res.status(200).json({ tasks: formattedTaskList });

      }


    } catch (error) {
      console.error('Error in task :', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  },

  //task Update
  taskUpdates: async (req, res) => {

    try {

      // Handle file upload using multer middleware
      upload(req, res, async function (err) {

        // upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          console.error(err);
          res.status(500).json({ error: "An error occurred during file upload." });
        } else if (err) {
          // An unknown error occurred when uploading.
          console.error(err);
          res.status(500).json({ error: "An unknown error occurred during file upload." });
        }



        const { taskID, userId, clientId, clientName, clientEmail, taskName, taskDate, address, lat, long } = req.body;


        // Check if any of the properties is empty or falsy
        if (!taskID || !taskName) {
          return res.status(400).json({ error: 'Task description is empty' });
        }


        const task = await taskModel.findById(taskID);

        if (!task) {
          return res.status(400).json({ error: 'Task id not found' });
        }


        // Check if file was provided
        let uploadedFile = '';

        if (req.file) {

          uploadedFile = "taskDoc/" + req.file.filename;
        }

        const myDate = new Date();
        const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
        const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');

        task.clientId = clientId || task.clientId;
        task.clientName = clientName || task.clientName;
        task.clientEmail = clientEmail || task.clientEmail;
        task.taskName = taskName || task.taskName;
        task.userId = userId || task.userId;
        task.taskDate = taskDate || task.taskDate;
        task.address = address || task.address;
        task.created = currentDate || task.created;
        task.taskDocument = uploadedFile || task.taskDocument;

        task.location.coordinates[0] = lat || task.location.coordinates[0];
        task.location.coordinates[1] = long || task.location.coordinates[1];

        await task.save();

        res.status(200).json({ message: 'Task updated successfully' });

      });


    } catch (error) {
      console.error('Error for update the task:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  },

  //task delete
  taskDelete: async (req, res) => {

    try {

      const { taskId } = req.params;

      // Check if the task exists
      const existingTask = await taskModel.findById(taskId);

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Perform the deletion
      await taskModel.findByIdAndDelete(taskId);

      // Send a success response
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error for task Delete:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  },

  // taskDone
  taskDone: async (req, res) => {

    try {

      upload(req, res, async function (err) {

        if (err instanceof multer.MulterError) {
          res.status(500).json({ error: "An error occurred during file upload." });
        } else if (err) {
          res.status(500).json({ error: "An unknown error occurred during file upload." });
        }

        const { taskID, notes, lat, long } = req.body;

        const myDate = new Date();
        const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
        const taskEndDate = currentDateIST.format('YYYY-MM-DD hh:mm A');


        // Check if any of the properties is empty or falsy
        if (!taskID) {
          return res.status(400).json({ error: 'TaskID is empty' });
        }

        if (!lat || !long) {
          return res.status(400).json({ error: 'Lat and Long is empty' });
        }


        const task = await taskModel.findById(taskID);

        if (!task) {
          return res.status(400).json({ error: 'Task is not found' });
        }

        // get lat long
        //const tasklat  = task.location.coordinates[0];
        //const tasklong = task.location.coordinates[1];

        // Get coordinates of the task
        //const taskCoords = `${task.location.coordinates[0]},${task.location.coordinates[1]}`;
       // const myCoords = `${lat},${long}`;

        // Calculate distance using your userService
        // const originCoords = await userService.parseCoordinates(myCoords);
        // const destinationCoords = await userService.parseCoordinates(taskCoords);
        // const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);
        // const distance = result.data.rows[0].elements[0].distance.text;
        // let distanceInMeters;
        //if(tasklat != '' && tasklong != ''){

          ///if (distance.includes('km')) {
            // Extract kilometers and convert to meters
          //  distanceInMeters = parseFloat(distance.split(' ')[0]) * 1000; // Extract "6.0", convert to float, multiply by 1000
        //  } else {
            // Extract meters
          //  distanceInMeters = parseInt(distance.split(' ')[0]); // Extract "59", convert to integer
         // }


          // if (distanceInMeters > 300) {
          //   return res.status(403).json({ error: 'You are not within 300 meters range of the task location' });
          // }
          // range 300meter
        //}

        // Check if file was provided
        
        let uploadedFile = '';

        if (req.file) {

          uploadedFile = "taskDoc/" + req.file.filename;
        }

        //get address from where task done
        // const locationGet = await userService.getLocation(lat, long);
        const locationGet = 0;

        task.status = 1 || task.status;
        task.taskNotes = notes || task.taskNotes;
        task.documentNotes = uploadedFile || task.documentNotes;
        task.taskAddress = locationGet || task.taskAddress;
        task.location.coordinates[0] = lat || task.location.coordinates[0];
        task.location.coordinates[1] = long || task.location.coordinates[1];
        task.taskEndDate = taskEndDate || task.taskEndDate;

        await task.save();

        //track log inser here
        const newTrack = new trackModel({
          userId: task.userId,
          userType: "Task",
          status: 1,
          taskId: taskID,
          attendceId: 0,
          lat: lat,
          long: long,
          createdAt: taskEndDate,
        })
        await newTrack.save();
        // end track log


        res.status(200).json({ message: 'Task Done Successfully' });

      });

    } catch (error) {
      console.error('Error in updating task status:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  },

  //get distance and duration
  CheckDistanceAndDuration: async (req, res) => {

    try {

      const { origin, destination } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({ message: 'Origin and destination coordinates are required.' });
      }

      // Parse origin and destination coordinates
      const originCoords = await userService.parseCoordinates(origin);
      const destinationCoords = await userService.parseCoordinates(destination);

      const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

      const distance = result.data.rows[0].elements[0].distance.text;
      const duration = result.data.rows[0].elements[0].duration.text;

      const destination_addresses = result.data.destination_addresses;
      const origin_addresses = result.data.origin_addresses;



      res.status(200).json({
        message: 'Get successfully', distance,
        duration

      });

      // res.status(200).json({
      //   message: 'Get successfully', distance,
      //   duration,
      //   origin: {
      //     address: origin_addresses,
      //     coordinates: originCoords,
      //   },
      //   destination: {
      //     address: destination_addresses,
      //     coordinates: destinationCoords,
      //   },
      //   destination_addresses,
      //   origin_addresses,
      // });

    } catch (error) {
      console.error('Error fetching distance and duration:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },


};




//module.exports end