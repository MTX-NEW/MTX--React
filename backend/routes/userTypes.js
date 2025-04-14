const express = require("express");
const router = express.Router();
const UserType = require("../models/UserType");
const { ValidationError, UniqueConstraintError } = require("sequelize");

// Get all user types
router.get("/", async (req, res) => {
  try {
    const types = await UserType.findAll();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user type
router.post("/", async (req, res) => {
  try {
    const newType = await UserType.create({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.status(201).json(newType);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: `${err.path} already exists`,
        })),
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update a user type
router.put("/:id", async (req, res) => {
  try {
    const type = await UserType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: "User type not found" });

    await type.update(req.body);
    res.json(type);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a user type
router.delete("/:id", async (req, res) => {
  try {
    const type = await UserType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: "User type not found" });

    await type.destroy();
    res.json({ message: "User type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 