const { PartsSupplier } = require("../models/Maintenance");
const { ValidationError } = require("sequelize");

// Get all parts suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await PartsSupplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new parts supplier
exports.createSupplier = async (req, res) => {
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
};

// Update a parts supplier
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await PartsSupplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    
    await supplier.update(req.body);
    res.json(supplier);
  } catch (error) {
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
};

// Delete a parts supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await PartsSupplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    
    await supplier.destroy();
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 