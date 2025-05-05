const express = require("express");
const router = express.Router();
const tripMemberController = require("../controllers/tripMemberController");

// Search trip members by name
router.get("/search", tripMemberController.searchMembers);

// Get all trip members
router.get("/", tripMemberController.getAllMembers);

// Get a specific trip member by ID
router.get("/:id", tripMemberController.getMemberById);

// Create a new trip member
router.post("/", tripMemberController.createMember);

// Update a trip member
router.put("/:id", tripMemberController.updateMember);

// Delete a trip member
router.delete("/:id", tripMemberController.deleteMember);

// Get member locations
router.get("/:id/locations", tripMemberController.getMemberLocations);

module.exports = router; 