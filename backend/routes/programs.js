const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");

// Get all programs (with their plans)
router.get("/", programController.getAllPrograms);

// Create a new program (with optional plans)
router.post("/", programController.createProgram);

// Update a program (and its plans)
router.put("/:id", programController.updateProgram);

// Delete a program (and its plans via cascade)
router.delete("/:id", programController.deleteProgram);

// Get companies with their programs
router.get("/companies", programController.getCompanies);

module.exports = router; 