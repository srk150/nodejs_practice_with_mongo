const express = require('express');
const router  = express.Router();
const taskController = require('../controllers/taskController');

// Define your all task Controller route
router.post('/create', taskController.createTask);
router.post('/list', taskController.taskList);
module.exports = router;
