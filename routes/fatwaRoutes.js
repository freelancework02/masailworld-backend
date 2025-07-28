// routes/fatwaRoutes.js
const express = require('express');
const router = express.Router();
const fatwaController = require('../controllers/fatwaController');

// router.get('/', fatwaController.getAllFatwas);
router.post('/', fatwaController.createFatwa);

module.exports = router;
