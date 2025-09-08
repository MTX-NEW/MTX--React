const EDIClientSetting = require("../models/EDIClientSetting");
const { ValidationError } = require("sequelize");

// Get current EDI client settings
exports.getEDISettings = async (req, res) => {
  try {
    const settings = await EDIClientSetting.findOne({ 
      where: { is_active: true } 
    });

    if (!settings) {
      return res.status(404).json({ error: 'EDI client settings not found' });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching EDI settings:', error);
    res.status(500).json({ error: 'Failed to fetch EDI settings' });
  }
};

// Update EDI client settings
exports.updateEDISettings = async (req, res) => {
  try {
    const {
      sender_id,
      receiver_id,
      receiver_name,
      interchange_control_version,
      default_provider_npi,
      default_taxonomy,
      mileage_rate,
      base_transport_rate
    } = req.body;

    // Validate required fields
    if (!sender_id || !receiver_id || !default_provider_npi) {
      return res.status(400).json({ 
        error: 'Sender ID, Receiver ID, and Default Provider NPI are required' 
      });
    }

    // Check if settings exist
    let settings = await EDIClientSetting.findOne({ 
      where: { is_active: true } 
    });

    if (settings) {
      // Update existing settings
      await settings.update({
        sender_id,
        receiver_id,
        receiver_name,
        interchange_control_version,
        default_provider_npi,
        default_taxonomy,
        mileage_rate,
        base_transport_rate,
        updated_at: new Date()
      });
    } else {
      // Create new settings
      settings = await EDIClientSetting.create({
        sender_id,
        receiver_id,
        receiver_name,
        interchange_control_version,
        default_provider_npi,
        default_taxonomy,
        mileage_rate,
        base_transport_rate,
        is_active: true
      });
    }

    res.json({
      message: 'EDI settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Error updating EDI settings:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ 
        error: 'Validation error',
        details: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    } else {
      res.status(500).json({ error: 'Failed to update EDI settings' });
    }
  }
};

// Initialize default EDI settings
exports.initializeEDISettings = async (req, res) => {
  try {
    // Check if settings already exist
    const existingSettings = await EDIClientSetting.findOne({ 
      where: { is_active: true } 
    });

    if (existingSettings) {
      return res.status(409).json({ 
        error: 'EDI settings already exist',
        settings: existingSettings
      });
    }

    // Create default settings
    const defaultSettings = await EDIClientSetting.create({
      sender_id: 'MTXPROVIDER',
      receiver_id: 'AHCCCS',
      receiver_name: 'ARIZONA HEALTH CARE',
      interchange_control_version: '00501',
      default_provider_npi: '1234567890', // This should be updated with actual NPI
      default_taxonomy: '343900000X', // Transportation services
      mileage_rate: 2.50,
      base_transport_rate: 25.00,
      is_active: true
    });

    res.status(201).json({
      message: 'Default EDI settings created successfully',
      settings: defaultSettings
    });

  } catch (error) {
    console.error('Error initializing EDI settings:', error);
    res.status(500).json({ error: 'Failed to initialize EDI settings' });
  }
};

module.exports = exports;
