const clientModel = require('../models/clientModel');
const employeeModel = require('../models/employeeModel');
const vendorModel = require('../models/vendorModel');

const userService = require('../services/userService');

const multer = require('multer');
const path = require('path');
const moment = require('moment-timezone');

// Storage configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/clientDoc");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage }).single("clientDocument");


module.exports = {

    //For create api using vendor
    createClient: async (req, res) => {

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

                const { clientFullName, clientEmail, clientMobile, clientCompany, clientAddress, clientCity, clientState, clientCountry, clientZip, lat, long, vendorId, type } = req.body;

                if (!clientFullName || !clientEmail || !clientMobile || !clientCompany || !clientAddress || !clientCity || !clientState || !clientCountry || !clientZip || !lat || !long || !vendorId || !type) {
                    return res.status(400).json({ error: 'One or more fields are empty' });
                }

                // Check if file was provided

                let uploadedFile = '';

                if (!req.file) {

                    uploadedFile = '';

                } else {

                    //uploadedFile = process.env.BASE_URL + "/" + req.file.path.replace(/\\/g, "/");
                    uploadedFile = "clientDoc/" + req.file.filename;

                }

                const existingEmail = await clientModel.findOne({ clientEmail });
                const existingMobile = await clientModel.findOne({ clientMobile });

                let createdBy = '';
                if (type == 'vendor') {

                    const existingvendor = await vendorModel.findOne({ _id: vendorId });

                    createdBy = existingvendor.vendorName;

                } else if (type == 'employee') {

                    const existingvendor = await employeeModel.findOne({ _id: vendorId });
                    createdBy = existingvendor.fullname;

                }

                if (!await userService.isValidEmail(clientEmail)) {
                    return res.status(400).json({ message: 'Invalid email address' });
                }
                if (!await userService.isValidMobile(clientMobile)) {
                    return res.status(400).json({ message: 'Invalid mobile number' });
                }

                if (existingEmail) {
                    return res.status(400).json({ message: 'Email already exists' });
                }

                if (existingMobile) {
                    return res.status(400).json({ message: 'Mobile already exists' });
                }


                const myDate = new Date();
                const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
                const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');


                const newClient = new clientModel({
                    clientFullName,
                    clientEmail,
                    clientMobile,
                    clientCompany,
                    clientAddress,
                    clientCity,
                    clientState,
                    clientCountry,
                    clientZip,
                    vendorId,
                    createdBy,
                    type,
                    clientLocation: {
                        type: 'Point',
                        coordinates: [parseFloat(lat), parseFloat(long)],
                    },
                    created: currentDate,
                    clientDocument: uploadedFile,

                });

                await newClient.save();

                res.status(201).json({ message: 'Client created successfully' });

            }); //multer

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error in creating Client' });
        }


    },



    //For clientList api for admin
    clientList: async (req, res) => {

        try {

            const { vendorId } = req.params;

            // Fetching employees with the given vendorId
            const employees = await employeeModel.find({ vendorId: vendorId });
            const employeeIds = employees.map(employee => employee._id);
            const clientList = await clientModel.find({
                vendorId: { $in: [vendorId, ...employeeIds] }
            });

            // Check if clientList array is empty
            if (!clientList || clientList.length === 0) {
                return res.status(404).json({ message: 'clientList not found' });
            }

            res.status(200).json(clientList);

        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },


    //For clientDetails
    clientDetails: async (req, res) => {

        try {

            const { clientId } = req.params;


            const clientDetails = await clientModel.findById(clientId);

            if (!clientDetails) {
                return res.status(404).json({ message: 'Client not found' });
            }

            res.status(200).json(clientDetails);

        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },


    //For updateClient update
    updateClient: async (req, res) => {

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


                const { clientId } = req.params;

                const { clientFullName, clientEmail, clientMobile, clientCompany, clientAddress, clientCity, clientState, clientCountry, clientZip, lat, long } = req.body;

                if (!clientFullName || !clientEmail || !clientMobile || !clientCompany || !clientAddress || !clientCity || !clientState || !clientCountry || !clientZip || !lat || !long) {
                    return res.status(400).json({ error: 'One or more fields are empty' });
                }

                // Check if file was provided

                let uploadedFile = '';

                if (req.file) {

                    uploadedFile = "clientDoc/" + req.file.filename;

                }



                const Client = await clientModel.findById(clientId);

                if (!await userService.isValidEmail(clientEmail)) {
                    return res.status(400).json({ message: 'Invalid email address' });
                }
                if (!await userService.isValidMobile(clientMobile)) {
                    return res.status(400).json({ message: 'Invalid mobile number' });
                }


                //already check mobile for client
                if (clientMobile !== Client.clientMobile) {

                    const existingMobile = await clientModel.findOne({ clientMobile });


                    if (existingMobile && existingMobile._id.toString() !== clientId) {
                        return res.status(400).json({ message: 'Mobile number already exists for another client' });
                    }
                }


                //already check email for client
                if (clientEmail !== Client.clientEmail) {

                    const existingEmail = await clientModel.findOne({ clientEmail });


                    if (existingEmail && existingEmail._id.toString() !== clientId) {
                        return res.status(400).json({ message: 'Email Id already exists for another client' });
                    }
                }




                const myDate = new Date();
                const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
                const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');

                // Update profile fields
                Client.clientFullName = clientFullName || Client.clientFullName;
                Client.clientEmail = clientEmail || Client.clientEmail;
                Client.clientMobile = clientMobile || Client.clientMobile;
                Client.clientCompany = clientCompany || Client.clientCompany;
                Client.clientAddress = clientAddress || Client.clientAddress;

                Client.clientCity = clientCity || Client.clientCity;
                Client.clientState = clientState || Client.clientState;
                Client.clientCountry = clientCountry || Client.clientCountry;
                Client.clientZip = clientZip || Client.clientZip;

                Client.clientLocation.coordinates[0] = lat || Client.clientLocation.coordinates[0];
                Client.clientLocation.coordinates[1] = long || Client.clientLocation.coordinates[1];

                Client.clientDocument = uploadedFile || Client.clientDocument;

                await Client.save();

                res.status(200).json({ message: 'Client updated successfully' });
            }); //multer
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }

    },


    //Client delete
    clientDelete: async (req, res) => {

        try {

            const { clientId } = req.params;

            // Check if the task exists
            const existingClient = await clientModel.findById(clientId);

            if (!existingClient) {
                return res.status(404).json({ message: 'Client not found' });
            }

            // Perform the deletion
            await clientModel.findByIdAndDelete(clientId);

            // Send a success response
            res.status(200).json({ message: 'Client deleted successfully' });
        } catch (error) {
            console.error('Error for Client Delete:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },


};
//module.exports end