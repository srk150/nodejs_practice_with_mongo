const employeeModel = require('../models/employeeModel');
const attendanceModel = require('../models/attendanceModel');
const taskModel = require('../models/taskModel');

const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

module.exports = {
    //For create employee api
    createEmp: async (req, res) => {
        try {
            const { fullname, mobile, userType, machineNumber, workLocation, vendorId } = req.body;

            if (!fullname || !mobile || !userType || !machineNumber || !workLocation || !vendorId) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            // Check if the mobile already exists
            const existingMobile = await employeeModel.findOne({ mobile });



            if (!await userService.isValidMobile(mobile)) {
                return res.status(400).json({ message: 'Invalid mobile number' });
            }

            if (existingMobile) {
                return res.status(400).json({ message: 'Mobile already exists' });
            }


            // Create a new user
            const newUser = new employeeModel({ fullname, mobile, userType, machineNumber, workLocation, vendorId });

            // Save the user to the database
            await newUser.save();

            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },



    // Employee list api
    getEmpList: async (req, res) => {
        try {
            const { vendorId } = req.params;

            const employees = await employeeModel.find({ vendorId: vendorId }, '-otp');

            if (!employees || employees.length === 0) { // Check if employees array is empty
                return res.status(404).json({ message: 'Employees not found' });
            }

            res.status(200).json(employees);

        } catch (error) {
            console.error('Error fetching all employees:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },



    //getEmployee details
    getEmployee: async (req, res) => {
        try {
            const { userId } = req.params;

            // Find the user by ID
            const emp = await employeeModel.findById(userId, '-otp');

            if (!emp) {
                return res.status(404).json({ message: 'Employee not found' });
            }

            res.status(200).json(emp);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    //updateEmployee data

    updateEmployee: async (req, res) => {

        try {

            const { userId } = req.params;

            const { fullname, mobile, userType, machineNumber, workLocation } = req.body;

            if (!fullname || !mobile || !userType || !machineNumber || !workLocation) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            // Find the user by ID
            const employee = await employeeModel.findById(userId);

            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }



            if (!await userService.isValidMobile(mobile)) {
                return res.status(400).json({ message: 'Invalid mobile number' });
            }


            // If the mobile number is updated, check if it already exists for another user
            if (mobile !== employee.mobile) {
                const existingMobile = await employeeModel.findOne({ mobile });

                if (existingMobile && existingMobile._id.toString() !== userId) {
                    return res.status(400).json({ message: 'Mobile number already exists for another employee' });
                }
            }

            // Update profile fields
            employee.fullname = fullname || employee.fullname;
            employee.mobile = mobile || employee.mobile;
            employee.userType = userType || employee.userType;
            employee.machineNumber = machineNumber || employee.machineNumber;
            employee.workLocation = workLocation || employee.workLocation;


            // Save the updated user to the database
            await employee.save();

            res.status(200).json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    //employee Login
    employeeLogin: async (req, res) => {

        try {
            const { mobileNumber } = req.body;

            const mobileNumberRegex = /^\d{10}$/;

            if (!mobileNumberRegex.test(mobileNumber)) {
                return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
            }

            const employee = await employeeModel.findOne({ mobile: mobileNumber });
            // const otpCode = await userService.generateOTP();
            const otpCode = "1234";

            if (!employee) {

                return res.status(404).json({ message: 'Mobile number not found in database.' });

            } else {

                const userId = employee._id;
                const update = { otp: otpCode };

                const result = await employeeModel.updateOne({ _id: userId }, update);

                if (result.matchedCount === 1) {

                    console.log('OTP updated successfully');

                } else {

                    console.log('employee not found or OTP not updated');
                }

                res.status(200).json({ message: 'Otp sent successfully!', otp: otpCode });

            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },

    //verify otp
    verifyOTP: async (req, res) => {
        try {
            const { otp, mobile } = req.body;


            if (!otp || !mobile) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            const storedOTP = await employeeModel.findOne({ mobile });

            if (!storedOTP) {
                return res.status(400).json({ message: 'Mobile Number Not Found' });
            }



            if (otp === storedOTP.otp) {

                //update user status
                const filter = { mobile: mobile };
                const update = { status: 1 };

                try {
                    const result = await employeeModel.updateOne(filter, update);
                    console.log(result.matchedCount === 1 ? 'Status updated successfully' : 'Error in Status updating!');
                } catch (error) {
                    console.error('Error updating OTP:', error);
                }

                // Generate a JWT token
                const token = jwt.sign({ userId: storedOTP._id, mobile: storedOTP.mobile }, 'yourSecretKey', {
                    expiresIn: '1h', // Token expiration time
                });


                res.status(200).json({ message: 'OTP verification successful', token });
            } else {
                res.status(400).json({ message: 'Invalid OTP' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to verify OTP' });
        }
    },


    //Employee Tracking Data
    getEmpTrack: async (req, res) => {
        try {

            const userId = req.params.userId;

            const employee = await employeeModel.findById(userId, '-otp');
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            const attendance = await attendanceModel.find({ userId });
            const tasks = await taskModel.find({ userId });
            const taskCount = tasks.length; // Count of tasks


            //get distance lat long start
            var distance;
            var duration;

            // console.log(attendance.length);

            if (attendance.length > 0 && attendance[0]['locationOut']['coordinates'][0]) {

                const originLat = attendance[0]['locationIn']['coordinates'][0];
                const originLong = attendance[0]['locationIn']['coordinates'][1];

                const destinationLat = attendance[0]['locationOut']['coordinates'][0];
                const destinationLong = attendance[0]['locationOut']['coordinates'][1];

                const locationInLatLong = originLat + ',' + originLong;
                const locationOutLatLong = destinationLat + ',' + destinationLong;

                const originCoords = await userService.parseCoordinates(locationInLatLong);
                const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

                const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

                distance = result.data.rows[0].elements[0].distance.text;
                duration = result.data.rows[0].elements[0].duration.text;

            } else {

                distance = 0;
                duration = 0;
            }
            //end loc

            const response = {
                employee: employee,
                employeeAttendance: attendance,
                employeeTasks: tasks,
                origin: {
                    distance: distance,
                    duration: duration,
                    taskCount: taskCount
                }
            };

            res.status(200).json(response);


        } catch (error) {
            console.error('Error fetching employee--tracking-related data:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    //delete employee
    empDelete: async (req, res) => {

        try {

            const { userId } = req.params;

            // Check if the task exists
            const existingemp = await employeeModel.findById(userId);

            if (!existingemp) {
                return res.status(404).json({ message: 'Employee not found' });
            }

            // Perform the deletion
            await employeeModel.findByIdAndDelete(userId);

            // Send a success response
            res.status(200).json({ message: 'Employee deleted successfully' });
        } catch (error) {
            console.error('Error for Employee Delete:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },

};
//module.exports end






