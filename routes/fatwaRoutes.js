const express = require('express');
const router = express.Router();
const fatwaController = require('../controllers/fatwaController');

// Create new fatwa
router.post('/', fatwaController.createFatwa);

// Get all fatwas
router.get('/', fatwaController.getAllFatwas);

// Get single fatwa by ID
router.get('/:id', fatwaController.getFatwaById);

// Update fatwa by ID
router.put('/:id', fatwaController.updateFatwa);

// Delete fatwa by ID
router.delete('/:id', fatwaController.deleteFatwa);

module.exports = router;
