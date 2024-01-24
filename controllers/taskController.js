const taskModel = require('../models/taskModel');
const userService = require('../services/userService');

const axios = require('axios');
const YOUR_GOOGLE_MAPS_API_KEY = process.env.GMAPAPI;


module.exports = {
  //For attendance in api

  createTask: async (req, res) => {
    try {
      const { userId, clientId, task, taskDesc, address, lat, long } = req.body;

      // Check if any of the properties is empty or falsy
      if (!userId || !clientId || !task || !taskDesc || !address || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }
      const currentDate = new Date();

      const newTask = new taskModel({
        userId,
        clientId,
        task,
        taskDesc,
        address,
        created: currentDate,
        location: {
          type: 'Point',
          coordinates: [parseFloat(lat), parseFloat(long)],
        },
      });

      await newTask.save();

      res.status(201).json({ message: 'Task created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error in creating task' });
    }


  },



  //For attendance out api
  taskList: async (req, res) => {

    try {
      const taskList = await taskModel.find();

      res.status(200).json(taskList);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

<<<<<<< HEAD
  },

  //task Edit
  taskEdit: async (req, res) => {

    try {

      const { taskID } = req.params;

      // Find the task by ID
      const taskGet = await taskModel.findById(taskID);

      if (!taskGet) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json(taskGet);


    } catch (error) {
      console.error('Error for update the task:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }


  },
  //task Update
  taskUpdate: async (req, res) => {

    try {

      const { taskID, userId, clientId, task, taskDesc, address, lat, long } = req.body;

      // Check if any of the properties is empty or falsy
      if (!taskID) {
        return res.status(400).json({ error: 'Task id is empty' });
      }

      if (!userId || !clientId || !task || !taskDesc || !address || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }

      const currentDate = new Date();

      const newTask = {
        clientId,
        task,
        userId,
        taskDesc,
        address,
        created: currentDate,
        location: {
          type: 'Point',
          coordinates: [parseFloat(lat), parseFloat(long)],
        },
      };

      const result = await taskModel.updateOne({ _id: taskID }, newTask);

      if (result.matchedCount === 1) {

        console.log('Task updated successfully');
        res.status(200).json({ message: 'Task updated successfully' });


      } else {

        console.log('Task not found');
        res.status(500).json({ message: 'Task not found' });

      }


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

      const { taskId } = req.params;

      // Check if the task exists
      const existingTask = await taskModel.findById(taskId);

      if (!taskId) {
        return res.status(400).json({ error: 'Task id is empty' });
      }

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }



      const updateTask = {
        status: "Done",

      };

      const result = await taskModel.updateOne({ _id: taskId }, updateTask);

      if (result.matchedCount === 1) {

        console.log('Task done successfully');
        res.status(200).json({ message: 'Task done successfully' });


      } else {

        console.log('Task not found');
        res.status(500).json({ message: 'Task not found' });

      }

    } catch (error) {
      console.error('Error in updating task:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  },

};
//module.exports end
=======
  },

  //task Edit
  taskEdit: async (req, res) => {

    try {

      const { taskID } = req.params;

      // Find the task by ID
      const taskGet = await taskModel.findById(taskID);

      if (!taskGet) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json(taskGet);


    } catch (error) {
      console.error('Error for update the task:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }


  },
  //task Update
  taskUpdate: async (req, res) => {

    try {

      const { taskID, userId, clientId, task, taskDesc, address, lat, long } = req.body;

      // Check if any of the properties is empty or falsy
      if (!taskID) {
        return res.status(400).json({ error: 'Task id is empty' });
      }

      if (!userId || !clientId || !task || !taskDesc || !address || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }

      const currentDate = new Date();

      const newTask = {
        clientId,
        task,
        userId,
        taskDesc,
        address,
        created: currentDate,
        location: {
          type: 'Point',
          coordinates: [parseFloat(lat), parseFloat(long)],
        },
      };

      const result = await taskModel.updateOne({ _id: taskID }, newTask);

      if (result.matchedCount === 1) {

        console.log('Task updated successfully');
        res.status(200).json({ message: 'Task updated successfully' });


      } else {

        console.log('Task not found');
        res.status(500).json({ message: 'Task not found' });

      }


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

      const { taskId } = req.params;

      // Check if the task exists
      const existingTask = await taskModel.findById(taskId);

      if (!taskId) {
        return res.status(400).json({ error: 'Task id is empty' });
      }

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }



      const updateTask = {
        status: "Done",

      };

      const result = await taskModel.updateOne({ _id: taskId }, updateTask);

      if (result.matchedCount === 1) {

        console.log('Task done successfully');
        res.status(200).json({ message: 'Task done successfully' });


      } else {

        console.log('Task not found');
        res.status(500).json({ message: 'Task not found' });

      }

    } catch (error) {
      console.error('Error in updating task:', error);
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



      // res.status(200).json(distance, duration);
      res.status(200).json({
        message: 'Get successfully', distance,
        duration,
        origin: {
          address: origin_addresses,
          coordinates: originCoords,
        },
        destination: {
          address: destination_addresses,
          coordinates: destinationCoords,
        },
        destination_addresses,
        origin_addresses,
      });

    } catch (error) {
      console.error('Error fetching distance and duration:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },


};
//module.exports end


>>>>>>> 901b015016d63b6953ccd2b8745bdcfabc134872
