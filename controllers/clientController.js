const clientModel = require('../models/clientModel');
const userService = require('../services/userService');

module.exports = {
    //For attendance in api

    createClient: async (req, res) => {

        try {

            const { clientName, clientEmail, clientMobile, lat, long } = req.body;

            if (!clientName || !clientEmail || !clientMobile || !lat || !long) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            const existingEmail = await clientModel.findOne({ clientEmail });
            const existingMobile = await clientModel.findOne({ clientMobile });

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


            const currentDate = new Date();

            const newClient = new clientModel({
                clientName,
                clientEmail,
                clientMobile,
                clientLocation: {
                    type: 'Point',
                    coordinates: [parseFloat(lat), parseFloat(long)],
                },
                created: currentDate,

            });

            await newClient.save();

            res.status(201).json({ message: 'Client created successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error in creating Client' });
        }


    },



    //For attendance out api
    clientList: async (req, res) => {

        try {
            const clientList = await clientModel.find();

            res.status(200).json(clientList);
        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },


};
//module.exports end