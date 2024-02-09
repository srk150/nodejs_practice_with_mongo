const vendorModel = require('../models/vendorModel');
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

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
            const currentDate = new Date();

            if (!vendor) {

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


                res.status(200).json({ message: 'OTP verification successful', token });
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

            if (!vendorName || !vendorEmail || !vendorMobile || !vendorCompany || !vandorLat || !vandorLong) {
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


};
//module.exports end






