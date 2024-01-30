const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

router.post('/login-api', userController.loginSignupMobileOtp);
router.post('/verify', userController.verifyOTP);
router.post('/generate', userController.generateOTP);
router.post('/create-user', userController.signup);
router.get('/userList', userController.getAllUser);
router.get('/profile/:userId', userController.getUserProfile);
router.put('/update-profile/:userId', userController.updateUserProfile);
router.get('/trackUser/:userId', userController.getUserTrack);
router.post('/current-location', userController.currentLocation);

module.exports = router;
