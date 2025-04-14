const express = require("express");
const router = express.Router();
const { 
  Maintenance, 
  VehiclePart, 
  VehicleService, 
  MaintenancePart, 
  MaintenanceService 
} = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");
const { ValidationError } = require("sequelize");

// Get all maintenance records with details
router.get("/", async (req, res) => {
  try {
    const records = await Maintenance.findAll({
      include: [
        {
          model: Vehicle,
          attributes: ['vehicle_id', 'mtx_unit', 'make', 'model'],
          as: 'vehicle',
          required: false
        },
        { 
          model: MaintenanceService, 
          as: 'services',
          include: [{
            model: VehicleService,
            as: 'service'
          }],
          required: false
        },
        { 
          model: MaintenancePart, 
          as: 'parts',
          include: [{
            model: VehiclePart,
            as: 'part'
          }],
          required: false
        }
      ],
      order: [['service_date', 'DESC']]
    });
    
    if (!records) {
      return res.json([]);
    }

    const transformedRecords = records.map(record => {
      const plainRecord = record.get({ plain: true });
      return {
        ...plainRecord,
        vehicle: plainRecord.vehicle ? {
          ...plainRecord.vehicle,
          id: plainRecord.vehicle.vehicle_id
        } : null
      };
    });

    res.json(transformedRecords);
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    res.status(500).json({ 
      message: "Failed to fetch maintenance records",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create new maintenance record with services and parts
router.post("/", async (req, res) => {
  try {
    const { vehicle_id, mechanic, service_date, odometer, notes, services, parts } = req.body;
    
    const maintenance = await Maintenance.create({
      vehicle_id,
      mechanic,
      service_date,
      odometer,
      notes
    });

    if (services && Array.isArray(services) && services.length > 0) {
      await MaintenanceService.bulkCreate(
        services.map(s => ({
          maintenance_id: maintenance.id,
          service_id: s.service_id,
          actual_hours: s.actual_hours,
          actual_cost: s.actual_cost
        }))
      );
    }

    if (parts && Array.isArray(parts) && parts.length > 0) {
      await MaintenancePart.bulkCreate(
        parts.map(p => ({
          maintenance_id: maintenance.id,
          part_id: p.part_id,
          quantity: p.quantity,
          purchase_date: p.purchase_date,
          actual_price: p.actual_price,
          warranty_applied: p.warranty_applied
        }))
      );
    }

    const newRecord = await Maintenance.findByPk(maintenance.id, {
      include: [
        {
          model: Vehicle,
          attributes: ['vehicle_id', 'mtx_unit', 'make', 'model'],
          as: 'vehicle'
        },
        { 
          model: MaintenanceService, 
          as: 'services',
          include: [{
            model: VehicleService,
            as: 'service'
          }]
        },
        { 
          model: MaintenancePart, 
          as: 'parts',
          include: [{
            model: VehiclePart,
            as: 'part'
          }]
        }
      ]
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    res.status(500).json({ 
      message: "Failed to create maintenance record",
      error: error.message 
    });
  }
});

// Get maintenance history for a vehicle
router.get("/vehicle/:vehicleId", async (req, res) => {
  try {
    const records = await Maintenance.findAll({
      where: { vehicle_id: req.params.vehicleId },
      include: [
        {
          model: Vehicle,
          attributes: ['vehicle_id', 'mtx_unit', 'make', 'model'],
          as: 'vehicle'
        },
        { 
          model: MaintenanceService, 
          as: 'services'
        },
        { 
          model: MaintenancePart, 
          as: 'parts'
        }
      ],
      order: [['service_date', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    console.error("Error fetching vehicle maintenance history:", error);
    res.status(500).json({ 
      message: "Failed to fetch vehicle maintenance history",
      error: error.message 
    });
  }
});

// Update maintenance record
router.put("/:id", async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    await maintenance.update(req.body);
    
    const updatedRecord = await Maintenance.findByPk(req.params.id, {
      include: [
        {
          model: Vehicle,
          attributes: ['vehicle_id', 'mtx_unit', 'make', 'model'],
          as: 'vehicle'
        },
        { 
          model: MaintenanceService, 
          as: 'services'
        },
        { 
          model: MaintenancePart, 
          as: 'parts'
        }
      ]
    });

    res.json(updatedRecord);
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    res.status(500).json({ 
      message: "Failed to update maintenance record",
      error: error.message 
    });
  }
});

// Update services for a maintenance record
router.put('/:id/services', async (req, res) => {
  try {
    await MaintenanceService.destroy({ where: { maintenance_id: req.params.id } });
    if (Array.isArray(req.body) && req.body.length > 0) {
      const services = await MaintenanceService.bulkCreate(
        req.body.map(s => ({ ...s, maintenance_id: req.params.id }))
      );
      res.json(services);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error updating maintenance services:", error);
    res.status(500).json({ 
      message: "Failed to update maintenance services",
      error: error.message 
    });
  }
});

// Update parts for a maintenance record
router.put('/:id/parts', async (req, res) => {
  try {
    await MaintenancePart.destroy({ where: { maintenance_id: req.params.id } });
    if (Array.isArray(req.body) && req.body.length > 0) {
      const parts = await MaintenancePart.bulkCreate(
        req.body.map(p => ({ ...p, maintenance_id: req.params.id }))
      );
      res.json(parts);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error updating maintenance parts:", error);
    res.status(500).json({ 
      message: "Failed to update maintenance parts",
      error: error.message 
    });
  }
});

// Delete maintenance record
router.delete("/:id", async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    await maintenance.destroy();
    res.json({ message: "Maintenance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting maintenance record:", error);
    res.status(500).json({ 
      message: "Failed to delete maintenance record",
      error: error.message 
    });
  }
});

module.exports = router; 