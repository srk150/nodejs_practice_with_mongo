const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

router.post('/vendor-login', vendorController.vendorLogin);
router.post('/verify-vendor', vendorController.verifyOTPVendor);
router.get('/getVendor/:vendorId', vendorController.getVendorDetails);
router.put('/update-vendor/:vendorId', vendorController.updateVendor);
router.delete('/delete/:vendorId', vendorController.vendorDelete);
router.post('/trackVendor', vendorController.getTrackVendor);
router.post('/vendorTrackNew', vendorController.trackVendorNewRecord);
router.post('/current-location', vendorController.currentLocation);
router.post('/update-image', vendorController.imageUpdate);


module.exports = router;