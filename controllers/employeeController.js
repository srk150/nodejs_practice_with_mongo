const employeeModel = require('../models/employeeModel');
const attendanceModel = require('../models/attendanceModel');
const taskModel = require('../models/taskModel');
const clientModel = require('../models/clientModel');

const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

const moment = require('moment');

module.exports = {
    //For create employee api
    createEmp: async (req, res) => {
        try {
            const { fullname, mobile, userType, machineNumber, workLocation, vendorId } = req.body;

            if (!fullname || !mobile || !userType || !vendorId) {
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

            if (!fullname || !mobile || !userType) {
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


                res.status(200).json({ message: 'OTP verification successful', employee: storedOTP });
            } else {
                res.status(400).json({ message: 'Invalid OTP' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to verify OTP' });
        }
    },


    //Employee Tracking Data
    // getEmpTrack: async (req, res) => {
    //     try {

    //         const userId = req.params.userId;

    //         const employee = await employeeModel.findById(userId, '-otp');
    //         if (!employee) {
    //             return res.status(404).json({ error: 'Employee not found' });
    //         }

    //         const attendance = await attendanceModel.find({ userId: userId }).sort({ attnedanceDate: 1 });

    //         const tasks = await taskModel.find({ userId, status: 1 });

    //         const taskCount = tasks.length; // Count of tasks


    //         //get distance lat long start 
    //         var distance;
    //         var duration;

    //         const getCheckInOrigin = await attendanceModel.find({ userId: userId, status: "IN" }).sort({ attnedanceDate: -1 }).limit(1);
    //         const getCheckOutOrigin = await attendanceModel.find({ userId: userId, status: "OUT" }).sort({ attnedanceDate: -1 }).limit(1);

    //         const checkInRecord = attendance.find(record => record.status === "IN");
    //         const checkOutRecord = attendance.find(record => record.status === "OUT");


    //         if (checkInRecord && checkOutRecord && tasks.length == 0) {

    //             const originLat = getCheckInOrigin[0].attnedanceLat;
    //             const originLong = getCheckInOrigin[0].attnedanceLong;

    //             const destinationLat = getCheckOutOrigin[0].attnedanceLat;
    //             const destinationLong = getCheckOutOrigin[0].attnedanceLong;

    //             const locationInLatLong = originLat + ',' + originLong;
    //             const locationOutLatLong = destinationLat + ',' + destinationLong;

    //             const originCoords = await userService.parseCoordinates(locationInLatLong);
    //             const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

    //             const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

    //             distance = result.data.rows[0].elements[0].distance.text;
    //             duration = result.data.rows[0].elements[0].duration.text;

    //         } else {

    //             let startTaskLat, startTaskLong, endTaskLat, endTaskLong;
    //             for (let i = 0; i < tasks.length; i++) {
    //                 const task = tasks[i];
    //                 const taskLocation = task.location;

    //                 if (i === 0) {
    //                     // Save the start task coordinates
    //                     startTaskLat = taskLocation.coordinates[0];
    //                     startTaskLong = taskLocation.coordinates[1];
    //                 } else if (i === tasks.length - 1) {
    //                     // Save the end task coordinates
    //                     endTaskLat = taskLocation.coordinates[0];
    //                     endTaskLong = taskLocation.coordinates[1];
    //                 }

    //                 const originLat = (i === 0) ? checkInRecord.attnedanceLat : tasks[i - 1].location.coordinates[0];
    //                 const originLong = (i === 0) ? checkInRecord.attnedanceLong : tasks[i - 1].location.coordinates[1];
    //                 const destinationLat = taskLocation.coordinates[0];
    //                 const destinationLong = taskLocation.coordinates[1];

    //                 const locationInLatLong = originLat + ',' + originLong;
    //                 const locationOutLatLong = destinationLat + ',' + destinationLong;

    //                 const originCoords = await userService.parseCoordinates(locationInLatLong);
    //                 const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

    //                 const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

    //                 totalDistance += parseFloat(result.data.rows[0].elements[0].distance.text);
    //                 totalDuration += parseFloat(result.data.rows[0].elements[0].duration.text);
    //             }


    //             distance = 0;
    //             duration = 0;
    //         }
    //         //end loc

    //         const response = {
    //             employee: employee,
    //             employeeAttendance: attendance,
    //             employeeTasks: tasks,
    //             origin: {
    //                 distance: distance,
    //                 duration: duration,
    //                 taskCount: taskCount
    //             }
    //         };

    //         res.status(200).json(response);


    //     } catch (error) {
    //         console.error('Error fetching employee--tracking-related data:', error);
    //         res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // },



    getEmpTrack: async (req, res) => {
        try {


            const { userId, filterDate } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'User id is empty' });
            }


            // const userId = req.params.userId;

            const employee = await employeeModel.findById(userId, '-otp');
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            // const attendance = await attendanceModel.find({ userId: userId }, '-attnedanceAddress').sort({ attnedanceDate: 1 });
            const attendance = await attendanceModel.find({ userId: userId, createdAt: filterDate }, '-attnedanceAddress').sort({ attnedanceDate: 1 });
            const tasks = await taskModel.find({ userId, status: 1 }, '-taskAddress');
            const taskCount = tasks.length; // Count of tasks


            //get distance lat long start 
            let totalDistance = 0;
            let totalDuration = 0;

            const getCheckInOrigin = await attendanceModel.find({ userId: userId, status: "IN" }).sort({ attnedanceDate: -1 }).limit(1);
            const getCheckOutOrigin = await attendanceModel.find({ userId: userId, status: "OUT" }).sort({ attnedanceDate: -1 }).limit(1);

            const checkInRecord = attendance.find(record => record.status === "IN");
            const checkOutRecord = attendance.find(record => record.status === "OUT");


            // Calculate distance and duration for single task

            if (checkInRecord && tasks.length == 0) {

                if (checkOutRecord) {
                    const originLat = getCheckInOrigin[0].attnedanceLat;
                    const originLong = getCheckInOrigin[0].attnedanceLong;

                    const destinationLat = getCheckOutOrigin[0].attnedanceLat;
                    const destinationLong = getCheckOutOrigin[0].attnedanceLong;

                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await userService.parseCoordinates(locationInLatLong);
                    const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

                    const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

                    totalDistance = result.data.rows[0].elements[0].distance.text;
                    totalDuration = result.data.rows[0].elements[0].duration.text;
                } else {
                    totalDistance = 0;
                    totalDuration = 0;

                }

            } else if (checkInRecord && tasks.length === 1) {

                const taskLocation = tasks[0].location;

                // console.log(taskLocation.coordinates[0]);

                const originLat = checkInRecord.attnedanceLat;
                const originLong = checkInRecord.attnedanceLong;
                const destinationLat = taskLocation.coordinates[0];
                const destinationLong = taskLocation.coordinates[1];

                const locationInLatLong = originLat + ',' + originLong;
                const locationOutLatLong = destinationLat + ',' + destinationLong;

                const originCoords = await userService.parseCoordinates(locationInLatLong);
                const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

                const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

                totalDistance = parseFloat(result.data.rows[0].elements[0].distance.text);
                totalDuration = parseFloat(result.data.rows[0].elements[0].duration.text);

                // If there's a check-out record, calculate distance and duration from task to check-out
                if (checkOutRecord) {
                    const originLat = taskLocation.coordinates[0];
                    const originLong = taskLocation.coordinates[1];
                    const destinationLat = checkOutRecord.attnedanceLat;
                    const destinationLong = checkOutRecord.attnedanceLong;

                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await userService.parseCoordinates(locationInLatLong);
                    const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

                    const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

                    totalDistance += parseFloat(result.data.rows[0].elements[0].distance.text);
                    totalDuration += parseFloat(result.data.rows[0].elements[0].duration.text);
                }
            } else {
                // Calculate distance and duration for each task
                let startTaskLat, startTaskLong, endTaskLat, endTaskLong;
                for (let i = 0; i < tasks.length; i++) {
                    const task = tasks[i];
                    const taskLocation = task.location;

                    if (i === 0) {
                        // Save the start task coordinates
                        startTaskLat = taskLocation.coordinates[0];
                        startTaskLong = taskLocation.coordinates[1];
                    } else if (i === tasks.length - 1) {
                        // Save the end task coordinates
                        endTaskLat = taskLocation.coordinates[0];
                        endTaskLong = taskLocation.coordinates[1];
                    }

                    const originLat = (i === 0) ? checkInRecord.attnedanceLat : tasks[i - 1].location.coordinates[0];
                    const originLong = (i === 0) ? checkInRecord.attnedanceLong : tasks[i - 1].location.coordinates[1];
                    const destinationLat = taskLocation.coordinates[0];
                    const destinationLong = taskLocation.coordinates[1];

                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await userService.parseCoordinates(locationInLatLong);
                    const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

                    const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

                    totalDistance += parseFloat(result.data.rows[0].elements[0].distance.text);
                    totalDuration += parseFloat(result.data.rows[0].elements[0].duration.text);
                }

                // If there's a check-out record, calculate distance and duration from last task to check-out
                if (checkOutRecord) {
                    const originLat = endTaskLat;
                    const originLong = endTaskLong;
                    const destinationLat = checkOutRecord.attnedanceLat;
                    const destinationLong = checkOutRecord.attnedanceLong;

                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await userService.parseCoordinates(locationInLatLong);
                    const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

                    const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

                    totalDistance += parseFloat(result.data.rows[0].elements[0].distance.text);
                    totalDuration += parseFloat(result.data.rows[0].elements[0].duration.text);
                }
            }

            //end loc

            const response = {
                employee: employee,
                employeeAttendance: attendance,
                employeeTasks: tasks,
                origin: {
                    distance: totalDistance,
                    duration: totalDuration,
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



    //CurrentLocation
    currentLocation: async (req, res) => {
        try {
            const { userId, lat, long } = req.body;

            if (!userId || !lat || !long) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            const employee = await employeeModel.findById(userId, '-otp');
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            employee.latitude = lat || employee.latitude;
            employee.longitude = long || employee.longitude;

            await employee.save();

            res.status(200).json({ message: 'Current location updated successfully' });

        } catch (error) {
            console.error('Error fetching employee current location', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    //cleint list for employee
    clientList: async (req, res) => {

        try {

            const { userId } = req.params;

            const clientList = await clientModel.find({ vendorId: userId });

            // Check if clientList array is empty
            if (!clientList || clientList.length === 0) {
                return res.status(404).json({ message: 'client List not found' });
            }

            res.status(200).json(clientList);

        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },

    //task list for employee
    taskList: async (req, res) => {

        try {

            const { userId } = req.params;
            //find data from employee id 
            const taskList = await taskModel.find({ vendorId: userId }, '-taskAddress');

            if (!taskList || taskList.length === 0) { // Check if Task array is empty
                return res.status(404).json({ message: 'Task not found' });
            }

            res.status(200).json(taskList);

        } catch (error) {
            console.error('Error fetching all users:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },



};
//module.exports end