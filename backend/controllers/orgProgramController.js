const OrgProgram = require("../models/OrgProgram");
const UserGroup = require("../models/UserGroup");
const { ValidationError, UniqueConstraintError } = require("sequelize");

// Get all programs with organisation info
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await OrgProgram.findAll({
      include: [
        {
          model: UserGroup,
          as: 'Organisation',
          attributes: ['group_id', 'full_name', 'common_name']
        }
      ],
      order: [['program_name', 'ASC']]
    });
    res.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single program by ID
exports.getProgramById = async (req, res) => {
  try {
    const program = await OrgProgram.findByPk(req.params.id, {
      include: [
        {
          model: UserGroup,
          as: 'Organisation',
          attributes: ['group_id', 'full_name', 'common_name']
        }
      ]
    });
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new program
exports.createProgram = async (req, res) => {
  try {
    const newProgram = await OrgProgram.create({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Fetch with organisation info
    const programWithOrg = await OrgProgram.findByPk(newProgram.program_id, {
      include: [
        {
          model: UserGroup,
          as: 'Organisation',
          attributes: ['group_id', 'full_name', 'common_name']
        }
      ]
    });
    
    res.status(201).json(programWithOrg);
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

// Update a program
exports.updateProgram = async (req, res) => {
  try {
    const program = await OrgProgram.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    await program.update({
      ...req.body,
      updated_at: new Date()
    });
    
    // Fetch with organisation info
    const updatedProgram = await OrgProgram.findByPk(program.program_id, {
      include: [
        {
          model: UserGroup,
          as: 'Organisation',
          attributes: ['group_id', 'full_name', 'common_name']
        }
      ]
    });
    
    res.json(updatedProgram);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await OrgProgram.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    await program.destroy();
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get programs by organisation
exports.getProgramsByOrganisation = async (req, res) => {
  try {
    const programs = await OrgProgram.findAll({
      where: { group_id: req.params.groupId },
      order: [['program_name', 'ASC']]
    });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
