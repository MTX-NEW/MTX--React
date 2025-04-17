const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");

// Get all programs
router.get("/", programController.getAllPrograms);

// Create a new program
router.post("/", programController.createProgram);

// Update a program
router.put("/:id", programController.updateProgram);

// Delete a program
router.delete("/:id", programController.deleteProgram);

// Get companies with their programs
router.get("/companies", programController.getCompanies);

module.exports = router; 