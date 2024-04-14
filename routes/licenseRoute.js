const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');

// Define your all task Controller route
router.post('/create', licenseController.insertLicense);
router.get('/list/:vendorId', licenseController.listLicensebyVendor);
router.get('/edit/:licenseId', licenseController.editLicense);
router.post('/update', licenseController.updateLicense);
router.delete('/delete/:licenseId', licenseController.deleteLicense);

module.exports = router;