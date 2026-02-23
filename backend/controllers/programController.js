const Program = require("../models/Program");
const ProgramPlan = require("../models/ProgramPlan");
const OrgProgram = require("../models/OrgProgram");
const UserGroup = require("../models/UserGroup");
const Provider = require("../models/Provider");
const { ValidationError } = require("sequelize");
const sequelize = require("sequelize");

// Get all programs with their plans
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.findAll({
      include: [
        {
          model: ProgramPlan,
          as: 'ProgramPlans'
        }
      ]
    });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new program
exports.createProgram = async (req, res) => {
  try {
    const { plans, ...programData } = req.body;
    
    // Create the program first
    const newProgram = await Program.create({
      ...programData,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Create plans if provided
    if (plans && Array.isArray(plans) && plans.length > 0) {
      const programPlans = plans.map(plan => ({
        ...plan,
        program_id: newProgram.program_id,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      await ProgramPlan.bulkCreate(programPlans);
      
      // Fetch the complete program with plans
      const programWithPlans = await Program.findByPk(newProgram.program_id, {
        include: [{ model: ProgramPlan, as: 'ProgramPlans' }]
      });
      
      res.status(201).json(programWithPlans);
    } else {
      res.status(201).json(newProgram);
    }
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
    const { plans, ...programData } = req.body;
    const programId = req.params.id;
    
    const program = await Program.findByPk(programId);
    if (!program) return res.status(404).json({ message: "Program not found" });

    // Update the program
    await program.update(programData);
    
    // Update plans if provided
    if (plans && Array.isArray(plans)) {
      // Get existing plans
      const existingPlans = await ProgramPlan.findAll({
        where: { program_id: programId }
      });
      
      // Delete plans that are not in the new list
      const newPlanIds = plans.filter(p => p.plan_id).map(p => p.plan_id);
      const plansToDelete = existingPlans.filter(p => !newPlanIds.includes(p.plan_id));
      
      for (const plan of plansToDelete) {
        await plan.destroy();
      }
      
      // Update or create plans
      for (const plan of plans) {
        if (plan.plan_id) {
          // Update existing plan
          await ProgramPlan.update(plan, {
            where: { plan_id: plan.plan_id }
          });
        } else {
          // Create new plan
          await ProgramPlan.create({
            ...plan,
            program_id: programId,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
    }
    
    // Get updated program with plans
    const updatedProgram = await Program.findByPk(programId, {
      include: [{ model: ProgramPlan, as: 'ProgramPlans' }]
    });
    
    res.json(updatedProgram);
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

// Sync org_programs (Manage Programs) into programs table, and Providers into ProgramPlans, so member form and trips see them
async function syncOrgProgramsToProgramsForGroup(groupId) {
  const orgPrograms = await OrgProgram.findAll({ where: { group_id: groupId } });
  if (orgPrograms.length === 0) return;
  const group = await UserGroup.findByPk(groupId);
  const companyName = group ? (group.common_name || group.full_name || `Organisation ${groupId}`) : `Organisation ${groupId}`;
  for (const op of orgPrograms) {
    const [program] = await Program.findOrCreate({
      where: { company_id: groupId, program_name: op.program_name },
      defaults: {
        company_id: groupId,
        company_name: companyName,
        program_name: op.program_name,
        phone: op.phone || null
      }
    });
    const providers = await Provider.findAll({ where: { program_id: op.program_id } });
    for (const prov of providers) {
      await ProgramPlan.findOrCreate({
        where: { program_id: program.program_id, plan_name: prov.provider_name },
        defaults: {
          program_id: program.program_id,
          plan_name: prov.provider_name
        }
      });
    }
  }
}

// Get programs by organisation (company_id = group_id; syncs from org_programs so Manage Programs entries appear)
exports.getProgramsByOrganisation = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    if (Number.isNaN(groupId)) {
      return res.status(400).json({ message: "Invalid organisation ID" });
    }
    await syncOrgProgramsToProgramsForGroup(groupId);
    const programs = await Program.findAll({
      where: { company_id: groupId },
      include: [{ model: ProgramPlan, as: 'ProgramPlans' }],
      order: [['program_name', 'ASC']]
    });
    res.json(programs);
  } catch (error) {
    console.error("Error fetching programs by organisation:", error);
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
          order: [['program_name', 'ASC']],
          include: [{ model: ProgramPlan, as: 'ProgramPlans' }]
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