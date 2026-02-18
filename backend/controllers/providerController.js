const Provider = require("../models/Provider");
const OrgProgram = require("../models/OrgProgram");
const UserGroup = require("../models/UserGroup");
const { ValidationError, UniqueConstraintError } = require("sequelize");

// Get all providers with program and organisation info
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.findAll({
      include: [
        {
          model: OrgProgram,
          as: 'Program',
          attributes: ['program_id', 'program_name', 'short_name', 'group_id'],
          include: [
            {
              model: UserGroup,
              as: 'Organisation',
              attributes: ['group_id', 'full_name', 'common_name']
            }
          ]
        }
      ],
      order: [['provider_name', 'ASC']]
    });
    res.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single provider by ID
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findByPk(req.params.id, {
      include: [
        {
          model: OrgProgram,
          as: 'Program',
          attributes: ['program_id', 'program_name', 'short_name', 'group_id'],
          include: [
            {
              model: UserGroup,
              as: 'Organisation',
              attributes: ['group_id', 'full_name', 'common_name']
            }
          ]
        }
      ]
    });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new provider
exports.createProvider = async (req, res) => {
  try {
    const newProvider = await Provider.create({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Fetch with program info
    const providerWithProgram = await Provider.findByPk(newProvider.provider_id, {
      include: [
        {
          model: OrgProgram,
          as: 'Program',
          attributes: ['program_id', 'program_name', 'short_name', 'group_id'],
          include: [
            {
              model: UserGroup,
              as: 'Organisation',
              attributes: ['group_id', 'full_name', 'common_name']
            }
          ]
        }
      ]
    });
    
    res.status(201).json(providerWithProgram);
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
};

// Update a provider
exports.updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findByPk(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    await provider.update({
      ...req.body,
      updated_at: new Date()
    });
    
    // Fetch with program info
    const updatedProvider = await Provider.findByPk(provider.provider_id, {
      include: [
        {
          model: OrgProgram,
          as: 'Program',
          attributes: ['program_id', 'program_name', 'short_name', 'group_id'],
          include: [
            {
              model: UserGroup,
              as: 'Organisation',
              attributes: ['group_id', 'full_name', 'common_name']
            }
          ]
        }
      ]
    });
    
    res.json(updatedProvider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a provider
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findByPk(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    await provider.destroy();
    res.json({ message: "Provider deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get providers by program
exports.getProvidersByProgram = async (req, res) => {
  try {
    const providers = await Provider.findAll({
      where: { program_id: req.params.programId },
      order: [['provider_name', 'ASC']]
    });
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
