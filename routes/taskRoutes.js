const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Define your all task Controller route
router.post('/create', taskController.createTask);
router.get('/list/:vendorId', taskController.taskList);
router.get('/edit/:taskID', taskController.taskEdit);
router.post('/task-update', taskController.taskUpdates);
router.delete('/delete/:taskId', taskController.taskDelete);
router.post('/done', taskController.taskDone);
router.post('/getDistance', taskController.CheckDistanceAndDuration);
router.get('/get-task-empids/:empId', taskController.taskListByEmp);

module.exports = router;