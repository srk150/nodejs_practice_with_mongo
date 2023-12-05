const clientModel = require('../models/clientModel');

module.exports = {
    //For attendance in api

    createClient: async (req, res) => {

        try {
            const { clientName } = req.body;

            // Check if any of the properties is empty or falsy
            if (!clientName) {
                return res.status(400).json({ error: 'Client name is empty' });
            }

            const currentDate = new Date();

            const newClient = new clientModel({
                clientName,
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