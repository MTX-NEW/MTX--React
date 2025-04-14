const express = require("express");
const router = express.Router();
const { PartsSupplier } = require("../models/Maintenance");
const { ValidationError } = require("sequelize");

router.get("/", async (req, res) => {
  try {
    const suppliers = await PartsSupplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const supplier = await PartsSupplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const supplier = await PartsSupplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    
    await supplier.update(req.body);
    res.json(supplier);
  } catch (error) {
    handleError(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supplier = await PartsSupplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    
    await supplier.destroy();
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function handleError(error, res) {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
  res.status(500).json({ message: error.message });
}

module.exports = router; 