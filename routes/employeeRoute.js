const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.post('/create-employee', employeeController.createEmp);
router.get('/empList/:vendorId', employeeController.getEmpList);
router.get('/getEmpDetail/:userId', employeeController.getEmployee);
router.put('/update-employee/:userId', employeeController.updateEmployee);
router.post('/employee-login', employeeController.employeeLogin);
router.post('/verify', employeeController.verifyOTP);
router.get('/trackEmployee/:userId', employeeController.getEmpTrack);
router.delete('/delete/:userId', employeeController.empDelete);
router.post('/current-location', employeeController.currentLocation);
router.get('/clientlist/:userId', employeeController.clientList);
router.get('/taskList/:userId', employeeController.taskList);

module.exports = router;
