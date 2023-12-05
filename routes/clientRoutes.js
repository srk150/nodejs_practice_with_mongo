const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Define your all task Controller route
router.post('/create', clientController.createClient);
router.get('/list', clientController.clientList);
module.exports = router;
