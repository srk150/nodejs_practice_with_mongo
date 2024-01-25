const User = require('../models/user');
const attendanceModel = require('../models/attendanceModel');
const taskModel = require('../models/taskModel');

const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

module.exports = {
  //For create employee api
  signup: async (req, res) => {
    try {
      const { fullname, mobile, userType, machineNumber, workLocation } = req.body;

      if (!fullname || !mobile || !userType || !machineNumber || !workLocation) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }

      // Check if the mobile already exists
      const existingMobile = await User.findOne({ mobile });



      if (!await userService.isValidMobile(mobile)) {
        return res.status(400).json({ message: 'Invalid mobile number' });
      }

      if (existingMobile) {
        return res.status(400).json({ message: 'Mobile already exists' });
      }


      // Create a new user
      const newUser = new User({ fullname, mobile, userType, machineNumber, workLocation });

      // Save the user to the database
      await newUser.save();

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  //login Signup Mobile Otp api
  loginSignupMobileOtp: async (req, res) => {

    try {
      const { mobileNumber } = req.body;

      const mobileNumberRegex = /^\d{10}$/;

      if (!mobileNumberRegex.test(mobileNumber)) {
        return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
      }

      const user = await User.findOne({ mobile: mobileNumber });
      // const otpCode = await userService.generateOTP();
      const otpCode = "1234";

      if (!user) {

        const newUser = new User({ mobile: mobileNumber, otp: otpCode });
        await newUser.save();

        res.status(200).json({ message: 'Otp sent successfully!', otp: otpCode });

      } else {
        const userId = user._id;
        const update = { otp: otpCode };

        const result = await User.updateOne({ _id: userId }, update);

        if (result.matchedCount === 1) {

          console.log('OTP updated successfully');

        } else {

          console.log('User not found or OTP not updated');
        }

        res.status(200).json({ message: 'Otp sent successfully!', otp: otpCode });

      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  },

  //generate otp

  generateOTP: async (req, res) => {
    try {
      const { mobile } = req.body;


      // Fetch the user from the database
      const user = await User.findOne({ mobile });


      if (!user) {
        return res.status(404).json({ message: 'Mobile number is not valid!' });
      }


      // Generate an OTP (for example, a 6-digit numeric code)
      // const otpCode = await userService.generateOTP();
      const otpCode = "1234";

      const userId = user._id;
      const filter = { _id: userId };
      const update = { otp: otpCode };

      //update otp in db

      try {
        const result = await User.updateOne(filter, update);
        console.log(result.matchedCount === 1 ? 'OTP updated successfully' : 'Error in updating!');
      } catch (error) {
        console.error('Error updating OTP:', error);
      }


      // Send the OTP via SMS 
      // Replace the next line with your code to send the OTP

      res.status(200).json({ message: 'OTP generated successfully', otp: otpCode });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to generate OTP' });
    }
  },

  //verify otp
  verifyOTP: async (req, res) => {
    try {
      const { otp, mobile } = req.body;

      const storedOTP = await User.findOne({ mobile });

      if (otp === storedOTP.otp) {

        //update user status
        const filter = { mobile: mobile };
        const update = { status: 1 };

        try {
          const result = await User.updateOne(filter, update);
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

  //users list api
  getAllUser: async (req, res) => {
    try {
      const users = await User.find({}, '-password -otp'); // Exclude password and OTP from the response

      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  //forgot api for sending link 

  forgotPassword: async (req, res) => {
    try {
      const { mobile } = req.body;

      // Find the user by email
      const user = await User.findOne({ mobile });

      if (!user) {
        return res.status(404).json({ message: 'Mobile number not found' });
      }

      // Generate a password reset token
      const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '15m' });

      // Send the password reset link via email (for demonstration purposes, log to the console)
      console.log('Password Reset Link:', `${process.env.BASE_URL}/api/user/reset-password/${token}`);

      res.status(200).json({ message: 'Password reset link sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  //reset api for change Password 

  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      // Verify the token
      const decodedToken = jwt.verify(token, 'yourSecretKey');

      // Find the user by the decoded user ID
      const user = await User.findById(decodedToken.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update the user's password
      user.password = newPassword;
      await user.save();

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      // Handle token expiration or invalid token errors
      console.error(error);
      res.status(400).json({ message: 'Invalid or expired token' });
    }
  },

  //get profile details
  getUserProfile: async (req, res) => {
    try {
      const { userId } = req.params;

      // Find the user by ID
      const user = await User.findById(userId, '-password -otp');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  //update profile data
  updateUserProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      // const { fullname, username, email, newPassword } = req.body;

      const { fullname, mobile, userType, machineNumber, workLocation } = req.body;

      if (!fullname || !mobile || !userType || !machineNumber || !workLocation) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }


      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      
     
      if (!await userService.isValidMobile(mobile)) {
        return res.status(400).json({ message: 'Invalid mobile number' });
      }


      // If the mobile number is updated, check if it already exists for another user
      if (mobile !== user.mobile) {
        const existingMobile = await User.findOne({ mobile });

        if (existingMobile && existingMobile._id.toString() !== userId) {
          return res.status(400).json({ message: 'Mobile number already exists for another user' });
        }
      }

      // Update profile fields
      user.fullname = fullname || user.fullname;
      user.mobile = mobile || user.mobile;
      user.userType = userType || user.userType;
      user.machineNumber = machineNumber || user.machineNumber;
      user.workLocation = workLocation || user.workLocation;

      // Update password if newPassword is provided
      // if (newPassword) {
      //   // Hash the new password
      //   const hashedPassword = await userService.hashPassword(newPassword);
      //   user.password = hashedPassword;
      // }

      // Save the updated user to the database
      await user.save();

      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },


  //getUserTrack
  getUserTrack: async (req, res) => {
    try {

      const userId = req.params.userId;

      const user = await User.findById(userId, '-password -otp');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const attendance = await attendanceModel.find({ userId });
      const tasks = await taskModel.find({ userId });

      res.status(200).json({ user, attendance, tasks });

    } catch (error) {
      console.error('Error fetching user--tracking-related data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },



};
//module.exports end






