const express = require("express");
const router = express.Router();
const partsSupplierController = require("../controllers/partsSupplierController");

// Get all parts suppliers
router.get("/", partsSupplierController.getAllSuppliers);

// Create a new parts supplier
router.post("/", partsSupplierController.createSupplier);

// Update a parts supplier
router.put("/:id", partsSupplierController.updateSupplier);

// Delete a parts supplier
router.delete("/:id", partsSupplierController.deleteSupplier);

module.exports = router; 