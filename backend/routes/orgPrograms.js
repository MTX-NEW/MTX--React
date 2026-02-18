const express = require("express");
const router = express.Router();
const orgProgramController = require("../controllers/orgProgramController");

// Get all programs
router.get("/", orgProgramController.getAllPrograms);

// Get programs by organisation
router.get("/organisation/:groupId", orgProgramController.getProgramsByOrganisation);

// Get single program
router.get("/:id", orgProgramController.getProgramById);

// Create a new program
router.post("/", orgProgramController.createProgram);

// Update a program
router.put("/:id", orgProgramController.updateProgram);

// Delete a program
router.delete("/:id", orgProgramController.deleteProgram);

module.exports = router;
