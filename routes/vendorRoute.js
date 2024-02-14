const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

router.post('/vendor-login', vendorController.vendorLogin);
router.post('/verify-vendor', vendorController.verifyOTPVendor);
router.get('/getVendor/:vendorId', vendorController.getVendorDetails);
router.put('/update-vendor/:vendorId', vendorController.updateVendor);
router.delete('/delete/:vendorId', vendorController.vendorDelete);

router.get('/trackVendor/:vendorId', vendorController.getTrackVendor);


module.exports = router;