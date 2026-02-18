const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");

// Get all providers
router.get("/", providerController.getAllProviders);

// Get providers by program
router.get("/program/:programId", providerController.getProvidersByProgram);

// Get single provider
router.get("/:id", providerController.getProviderById);

// Create a new provider
router.post("/", providerController.createProvider);

// Update a provider
router.put("/:id", providerController.updateProvider);

// Delete a provider
router.delete("/:id", providerController.deleteProvider);

module.exports = router;
