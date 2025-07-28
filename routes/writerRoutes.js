const express = require('express');
const router = express.Router();
const writerController = require('../controllers/writerController');

router.get('/', writerController.getAllWriters);
router.post('/', writerController.createWriter);

module.exports = router;
