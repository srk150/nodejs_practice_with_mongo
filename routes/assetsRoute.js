const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assetsController');

// Define your all task Controller route
router.post('/create', assetsController.insertAsset);
router.get('/list/:vendorId', assetsController.listAssetbyVendor);
router.get('/edit/:assetId', assetsController.editAsset);
router.post('/update', assetsController.updateAsset);
router.delete('/delete/:assetId', assetsController.deleteAsset);

module.exports = router;