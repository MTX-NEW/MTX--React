const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

// Create a new batch
router.post('/', batchController.createBatch.bind(batchController));

// Get all batches
router.get('/', batchController.getBatches.bind(batchController));

// Get detailed batch information
router.get('/:batch_id/details', batchController.getBatchDetails.bind(batchController));

// Process batch and generate EDI file
router.post('/:batch_id/process', batchController.processBatch.bind(batchController));

// Download EDI file
router.get('/:batch_id/download', batchController.downloadEDIFile.bind(batchController));

module.exports = router;
