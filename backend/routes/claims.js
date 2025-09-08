const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');

// Get all claims with optional filters
router.get('/', claimController.getAllClaims);

// Get specific claim by ID
router.get('/:id', claimController.getClaimById);

// Generate claims for multiple trips in batch
router.post('/generate-batch', claimController.generateBatch);

// Generate claim for a specific trip
router.post('/generate/:tripId', claimController.generateClaimForTrip);

// Generate EDI file for a specific claim
router.post('/:claimId/generate-edi', claimController.generateEDIFile);

// Legacy endpoint - Generate claim EDI directly
router.post('/generate-edi', claimController.generateClaimEDI);

module.exports = router;
