const express = require('express');
const router = express.Router();
const reimbrusController = require('../controllers/reimbrusController');

// Define your all task Controller route
router.post('/create', reimbrusController.createReimbrushment);
router.get('/list/:vendorId', reimbrusController.reimbrushmentList);
router.get('/edit/:reimbId', reimbrusController.reimbrushmentEdit);
router.post('/update', reimbrusController.reimbrushmentUpdate);
router.delete('/delete/:reimbId', reimbrusController.reimbrushmentDelete);

module.exports = router;