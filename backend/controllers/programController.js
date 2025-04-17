const Program = require("../models/Program");
const { ValidationError } = require("sequelize");
const sequelize = require("sequelize");

// Get all programs
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.findAll();
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new program
exports.createProgram = async (req, res) => {
  try {
    const newProgram = await Program.create({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.status(201).json(newProgram);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update a program
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });

    await program.update(req.body);
    res.json(program);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });

    await program.destroy();
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get companies with their programs
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Program.findAll({
      attributes: [
        'company_id',
        'company_name',
        [sequelize.fn('COUNT', sequelize.col('program_id')), 'program_count']
      ],
      group: ['company_id', 'company_name'],
      order: [['company_name', 'ASC']]
    });

    // Get programs for each company
    const companiesWithPrograms = await Promise.all(
      companies.map(async company => {
        const programs = await Program.findAll({
          attributes: ['program_id', 'program_name'],
          where: { company_id: company.company_id },
          order: [['program_name', 'ASC']]
        });
        
        return {
          ...company.get({ plain: true }),
          programs
        };
      })
    );

    res.json(companiesWithPrograms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 