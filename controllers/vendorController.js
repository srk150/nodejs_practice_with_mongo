const vendorModel = require('../models/vendorModel');
const assetsModel = require('../models/assetsModel');
const licenceModel = require('../models/licenceModel');

const employeeModel = require('../models/employeeModel');
const attendanceModel = require('../models/attendanceModel');
const taskModel = require('../models/taskModel');
const trackModel = require('../models/trackModel');


const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const multer = require('multer');
const path = require('path');



// Storage configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage }).single("profileImg");


module.exports = {

    //Login for vendor using mobile number
    vendorLogin: async (req, res) => {

        try {
            const { mobileNumber } = req.body;

            const mobileNumberRegex = /^\d{10}$/;

            if (!mobileNumberRegex.test(mobileNumber)) {
                return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
            }

            const vendor = await vendorModel.findOne({ vendorMobile: mobileNumber });
            // const otpCode = await userService.generateOTP();
            const otpCode = "1230";



            const myDate = new Date();
            const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
            const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');


            if (!vendor) {

                const existingMobile = await vendorModel.findOne({ vendorMobile: mobileNumber });
                const existingMobileEmp = await employeeModel.findOne({ mobile: mobileNumber });

                if (existingMobile) {
                    return res.status(400).json({ message: 'Mobile already exists' });
                }

                if (existingMobileEmp) {
                    return res.status(400).json({ message: 'Mobile already exists in employee panel' });

                }


                const newVendor = new vendorModel({ vendorMobile: mobileNumber, vandorOtp: otpCode, vandorCreated: currentDate });
                await newVendor.save();

                res.status(200).json({ message: 'Otp sent successfully!', otp: otpCode });

            } else {

                const userId = vendor._id;
                const update = { vandorOtp: otpCode };

                const result = await vendorModel.updateOne({ _id: userId }, update);

                if (result.matchedCount === 1) {

                    console.log('OTP updated successfully');

                } else {

                    console.log('vendor not found or OTP not updated');
                }

                res.status(200).json({ message: 'Otp sent successfully!', otp: otpCode });

            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },


    // getVendorDetails
    getVendorDetails: async (req, res) => {
        try {
            const { vendorId } = req.params;

            // Find the vendor by ID
            const vendor = await vendorModel.findById(vendorId, '-vandorOtp');

            if (!vendor) {
                return res.status(404).json({ message: 'Vendor not found' });
            }

            res.status(200).json(vendor);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },


    //verify vendor
    verifyOTPVendor: async (req, res) => {
        try {
            const { otp, mobile } = req.body;


            if (!otp || !mobile) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }


            const storedOTP = await vendorModel.findOne({ vendorMobile: mobile });

            if (!storedOTP) {
                return res.status(400).json({ message: 'Mobile Number Not Found' });
            }

            if (otp === storedOTP.vandorOtp) {

                //update user status
                const filter = { vendorMobile: mobile };
                const update = { status: "active" };

                try {
                    const result = await vendorModel.updateOne(filter, update);
                    console.log(result.matchedCount === 1 ? 'Status updated successfully' : 'Error in Status updating!');
                } catch (error) {
                    console.error('Error updating OTP:', error);
                }

                // Generate a JWT token
                const token = jwt.sign({ userId: storedOTP._id, mobile: storedOTP.vendorMobile }, 'yourSecretKey', {
                    expiresIn: '1h', // Token expiration time
                });


                res.status(200).json({ message: 'OTP verification successful', vendor: storedOTP });
            } else {
                res.status(400).json({ message: 'Invalid OTP' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to verify OTP' });
        }
    },

    //updateVendor 
    updateVendor: async (req, res) => {

        try {

            const { vendorId } = req.params;

            const { vendorName, vendorEmail, vendorMobile, vendorCompany, vandorLat, vandorLong } = req.body;

            if (!vendorName || !vendorMobile || !vendorCompany || !vandorLat || !vandorLong) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            // Find the user by ID
            const vendor = await vendorModel.findById(vendorId);

            if (!vendor) {
                return res.status(404).json({ message: 'Vendor not found' });
            }


            if (!await userService.isValidMobile(vendorMobile)) {
                return res.status(400).json({ message: 'Invalid mobile number' });
            }


            // If the mobile number is updated, check if it already exists for another user
            if (vendorMobile !== vendor.vendorMobile) {
                const existingMobile = await vendorModel.findOne({ vendorMobile });

                if (existingMobile && existingMobile._id.toString() !== vendorId) {
                    return res.status(400).json({ message: 'Mobile number already exists for another vendor' });
                }
            }

            // Update profile fields
            vendor.vendorName = vendorName || vendor.vendorName;
            vendor.vendorEmail = vendorEmail || vendor.vendorEmail;
            vendor.vendorMobile = vendorMobile || vendor.vendorMobile;
            vendor.vendorCompany = vendorCompany || vendor.vendorCompany;
            vendor.vandorLat = vandorLat || vendor.vandorLat;
            vendor.vandorLong = vandorLong || vendor.vandorLong;

            // Save the updated user to the database
            await vendor.save();

            //employee update company
            const employee = await employeeModel.find({ vendorId: vendorId });

            // 2. Update each user's company name
            for (let i = 0; i < employee.length; i++) {
                employee[i].companyName = vendorCompany;
                await employee[i].save(); // Save the updated user profile
            }

            res.status(200).json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },


    //delete Vendor
    vendorDelete: async (req, res) => {

        try {

            const { vendorId } = req.params;

            // Check if the task exists
            const existingvendor = await vendorModel.findById(vendorId);

            if (!existingvendor) {
                return res.status(404).json({ message: 'Vendor not found' });
            }

            // Perform the deletion
            await vendorModel.findByIdAndDelete(vendorId);

            // Send a success response
            res.status(200).json({ message: 'Vendor deleted successfully' });
        } catch (error) {
            console.error('Error for Vendor Delete:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },


    //Vendor Tracking Data

    //  getTrackVendor: async (req, res) => {
    //         try {

    //             const vendorId = req.params.vendorId;

    //             const vendor = await vendorModel.findById(vendorId, '-vandorOtp');
    //             if (!vendor) {
    //                 return res.status(404).json({ error: 'Vendor not found' });
    //             }

    //             const attendance = await attendanceModel.find({ userId: vendorId }).sort({ attnedanceDate: 1 });

    //             const tasks = await taskModel.find({ userId: vendorId, status: 1 });

    //             const taskCount = tasks.length; // Count of tasks


    //             //get distance lat long start 
    //             var distance;
    //             var duration;

    //             const getCheckInOrigin = await attendanceModel.find({ userId: vendorId, status: "IN" }).sort({ attnedanceDate: -1 }).limit(1);
    //             const getCheckOutOrigin = await attendanceModel.find({ userId: vendorId, status: "OUT" }).sort({ attnedanceDate: -1 }).limit(1);

    //             if (attendance.length > 0 && tasks.length == 0) {

    //                 const originLat = getCheckInOrigin[0].attnedanceLat;
    //                 const originLong = getCheckInOrigin[0].attnedanceLong;

    //                 const destinationLat = getCheckOutOrigin[0].attnedanceLat;
    //                 const destinationLong = getCheckOutOrigin[0].attnedanceLong;

    //                 const locationInLatLong = originLat + ',' + originLong;
    //                 const locationOutLatLong = destinationLat + ',' + destinationLong;

    //                 const originCoords = await userService.parseCoordinates(locationInLatLong);
    //                 const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

    //                 const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

    //                 distance = result.data.rows[0].elements[0].distance.text;
    //                 duration = result.data.rows[0].elements[0].duration.text;

    //             } else {

    //                 distance = 0;
    //                 duration = 0;
    //             }
    //             //end loc

    //             const response = {
    //                 vendor: vendor,
    //                 employeeAttendance: attendance,
    //                 employeeTasks: tasks,
    //                 origin: {
    //                     distance: distance,
    //                     duration: duration,
    //                     taskCount: taskCount
    //                 }
    //             };

    //             res.status(200).json(response);


    //         } catch (error) {
    //             console.error('Error fetching employee--tracking-related data:', error);
    //             res.status(500).json({ message: 'Internal Server Error' });
    //         }
    //     },


    getTrackVendor: async (req, res) => {
        try {


            const { vendorId, filterDate } = req.body;

            if (!vendorId) {
                return res.status(400).json({ error: 'Vendor id is empty' });
            }

            // const vendorId = req.params.vendorId;



            const vendor = await vendorModel.findById(vendorId, '-vandorOtp');
            if (!vendor) {
                return res.status(404).json({ error: 'Vendor not found' });
            }


            const attendance = await attendanceModel.find({ userId: vendorId, createdAt: filterDate }, '-attnedanceAddress').sort({ attnedanceDate: 1 });

            const tasks = await taskModel.find({ userId: vendorId, status: 1 }, '-taskAddress');
            const taskCount = tasks.length; // Count of tasks

            const getCheckInOrigin = await attendanceModel.find({ userId: vendorId, status: "IN" }).sort({ attnedanceDate: -1 }).limit(1);
            const getCheckOutOrigin = await attendanceModel.find({ userId: vendorId, status: "OUT" }).sort({ attnedanceDate: -1 }).limit(1);

            const checkInRecord = attendance.find(record => record.status === "IN");
            const checkOutRecord = attendance.find(record => record.status === "OUT");


            // Calculate distance and duration for single task
            let totalDistance = 0;
            let totalDuration = 0;

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
                vendorName: vendor,
                vendorAttendance: attendance,
                vendorTasks: tasks,
                origin: {
                    distance: totalDistance,
                    duration: totalDuration,
                    taskCount: taskCount
                }
            };

            res.status(200).json(response);


        } catch (error) {
            console.error('Error fetching vendor--tracking-related data:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },


    //CurrentLocation
    currentLocation: async (req, res) => {
        try {
            const { vendorId, lat, long } = req.body;

            if (!vendorId || !lat || !long) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            const vendor = await vendorModel.findById(vendorId, '-vandorOtp');
            if (!vendor) {
                return res.status(404).json({ error: 'Vendor not found' });
            }

            vendor.vandorLat = lat || vendor.vandorLat;
            vendor.vandorLong = long || vendor.vandorLong;

            await vendor.save();

            res.status(200).json({ message: 'Current location updated successfully' });

        } catch (error) {
            console.error('Error fetching vendor current location', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },


    imageUpdate: async (req, res) => {
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

                // Check if any of the properties is empty or falsy
                const { userId, type } = req.body;

                if (!userId || !type) {
                    return res.status(400).json({ error: 'User id and type is required!' });
                }

                // Check if file was provided
                let uploadedFile = '';

                if (req.file) {
                    uploadedFile = "images/" + req.file.filename;
                } else {
                    uploadedFile = "images/avtar.png";

                }

                if (type == 'vendor') {

                    const vendor = await vendorModel.findById(userId);

                    if (!vendor) {
                        return res.status(400).json({ error: 'vendor id not found' });
                    }

                    vendor.empImg = uploadedFile || vendor.empImg;
                    await vendor.save();

                } else {

                    const employee = await employeeModel.findById(userId);
                    if (!employee) {
                        return res.status(400).json({ error: 'employee id not found' });
                    }

                    employee.empImg = uploadedFile || employee.empImg;
                    await employee.save();

                }
                res.status(201).json({ message: 'Profile image updated successfully!' });

            });
        } catch (error) {
            console.error('Error fetching user data', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }

    },


    trackVendorNewRecord: async (req, res) => {
        try {
            const { userId, filterDate } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'Vendor id is empty' });
            }

            const vendor = await vendorModel.findById(userId, '-vandorOtp');
            if (!vendor) {
                return res.status(404).json({ error: 'Vendor not found' });
            }


            let query = { userId: userId };

            if (filterDate) {
                const startDate = new Date(filterDate);
                startDate.setUTCHours(0, 0, 0, 0); // Set to the start of the day
                const endDate = new Date(filterDate);
                endDate.setUTCHours(23, 59, 59, 999); // Set to the end of the day

                query.createdAt = {
                    $gte: startDate,
                    $lt: endDate
                };
            }


            //task count by 
            let query2 = { userId: userId, status: 1 };

            if (filterDate) {
                const startDate = new Date(filterDate);
                startDate.setUTCHours(0, 0, 0, 0); // Set to the start of the day
                const endDate = new Date(filterDate);
                endDate.setUTCHours(23, 59, 59, 999); // Set to the end of the day

                query2.taskEndDate = {
                    $gte: startDate,
                    $lt: endDate
                };
            }

            const tasksCount = await taskModel.find(query2, '-taskAddress');
            const taskCount = tasksCount.length; // Count of tasks


            //count date
            const trackData = await trackModel.find(query).sort({ createdAt: 1 });

            let mergedDetails = [];

            if (!trackData || trackData.length === 0) {
                // return res.status(404).json({ message: "No Data Found", track: [], vendor: vendor });

                const response = {
                    vendor: vendor,
                    track: [],
                    origin: {
                        distance: 0,
                        duration: 0,
                        taskCount: 0
                    }
                };

                return res.status(404).json({ message: "No Data Found", response });

            }

            for (let i = 0; i < trackData.length; i++) {
                const trackd = trackData[i];
                const userType = trackd.userType;
                const userId = trackd.userId;
                const status = trackd.status;
                const taskId = trackd.taskId;
                const attendceId = trackd.attendceId;


                if (userId && userType === 'vendor' && status === 'IN' && attendceId != '0') {
                    // const attDetailIn = await attendanceModel.findOne({ userId, status: 'IN' }).sort({ _id: -1 });
                    const attDetailIn = await attendanceModel.findOne({ _id: attendceId });
                    if (attDetailIn) {
                        mergedDetails.push(attDetailIn);
                    }
                }

                if (taskId && taskId != '0') {
                    const taskData = await taskModel.findOne({ _id: taskId });

                    if (taskData) {

                        const formattedTask = {
                            ...taskData.toObject(),
                            taskDate: moment(taskData.taskDate).format('YYYY-MM-DD hh:mm A'),
                            taskEndDate: moment(taskData.taskEndDate).format('YYYY-MM-DD hh:mm A')
                        };

                        mergedDetails.push(formattedTask);
                    }
                }

                if (userId && userType === 'vendor' && status === 'OUT' && attendceId != '0') {

                    const attDetailout = await attendanceModel.findOne({ _id: attendceId });

                    if (attDetailout) {
                        mergedDetails.push(attDetailout);
                    }
                }
            }

            //calculate distance duration from track start
            let totalDistance = 0;
            let totalDuration = 0;

            if (trackData.length > 0) {

                for (let i = 0; i < trackData.length - 1; i++) {

                    const originLat = trackData[i].lat;
                    const originLong = trackData[i].long;
                    const destinationLat = trackData[i + 1].lat;
                    const destinationLong = trackData[i + 1].long;


                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await userService.parseCoordinates(locationInLatLong);
                    const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

                    const resultDistance = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);


                    if (
                        resultDistance &&
                        resultDistance.data &&
                        resultDistance.data.rows &&
                        resultDistance.data.rows.length > 0 &&
                        resultDistance.data.rows[0].elements &&
                        resultDistance.data.rows[0].elements.length > 0 &&
                        resultDistance.data.rows[0].elements[0].distance &&
                        resultDistance.data.rows[0].elements[0].distance.text &&
                        resultDistance.data.rows[0].elements[0].duration &&
                        resultDistance.data.rows[0].elements[0].duration.text
                    ) {
                        totalDistance += parseFloat(resultDistance.data.rows[0].elements[0].distance.text);
                        totalDuration += parseFloat(resultDistance.data.rows[0].elements[0].duration.text);
                    }


                    // totalDistance += parseFloat(resultDistance.data.rows[0].elements[0].distance.text);
                    // totalDuration += parseFloat(resultDistance.data.rows[0].elements[0].duration.text);

                }
            }

            //calculate distance duration from track end

            const response = {
                vendor: vendor,
                track: mergedDetails,
                origin: {
                    distance: totalDistance,
                    duration: totalDuration,
                    taskCount: taskCount
                }
            };


            return res.status(200).json({ message: "Success", response });
        } catch (error) {
            console.error('Error fetching -related data:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }


};
//module.exports end






