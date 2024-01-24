const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Define your all task Controller route
router.post('/create', taskController.createTask);
router.get('/list', taskController.taskList);
router.get('/edit/:taskID', taskController.taskEdit);
router.post('/update', taskController.taskUpdate);
router.delete('/delete/:taskId', taskController.taskDelete);
router.get('/done/:taskId', taskController.taskDone);
<<<<<<< HEAD

module.exports = router;
=======
router.post('/getDistance', taskController.CheckDistanceAndDuration);

module.exports = router;
>>>>>>> 901b015016d63b6953ccd2b8745bdcfabc134872
