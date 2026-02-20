const Employee = require("../models/Employee");
const User = require("../models/User");
const UserType = require("../models/UserType");
const UserGroup = require("../models/UserGroup");
const bcrypt = require("bcrypt");
const sequelize = require("../db");

const includeOptions = [
  { model: UserType, as: 'UserType', attributes: ['type_id', 'display_name'] },
  { model: UserGroup, as: 'Organisation', attributes: ['group_id', 'common_name', 'full_name'] },
  { model: User, as: 'User', attributes: ['id', 'username', 'email'] }
];

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: includeOptions,
      order: [['created_at', 'DESC']]
    });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: includeOptions
    });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      business_phone,
      ssn,
      user_type_id,
      user_group_id,
      employee_type,
      hire_date,
      last_employment_date,
      certifications,
      status,
      // User account fields (optional)
      create_user_account,
      username,
      password
    } = req.body;

    let userId = null;

    // Create user account if requested
    if (create_user_account && username && password) {
      const existingUser = await User.findOne({ where: { username }, transaction: t });
      if (existingUser) {
        await t.rollback();
        return res.status(400).json({ message: "Username already exists" });
      }

      const newUser = await User.create({
        first_name,
        last_name,
        username,
        email: email || `${username}@company.local`,
        password,
        phone: phone || business_phone || '0000000000',
        emp_code: 'TEMP',
        user_group: user_group_id,
        user_type: user_type_id,
        status: status || 'Active'
      }, { transaction: t });

      userId = newUser.id;
    }

    // Create employee record
    const employee = await Employee.create({
      user_id: userId,
      first_name,
      last_name,
      email,
      phone,
      business_phone,
      ssn,
      user_type_id,
      user_group_id,
      employee_type,
      hire_date,
      last_employment_date,
      certifications,
      status: status || 'Active'
    }, { transaction: t });

    // Update user emp_code with employee's emp_id if user was created
    if (userId) {
      await User.update(
        { emp_code: employee.emp_id },
        { where: { id: userId }, transaction: t }
      );
    }

    await t.commit();

    // Fetch the created employee with associations
    const createdEmployee = await Employee.findByPk(employee.employee_id, {
      include: includeOptions
    });

    res.status(201).json(createdEmployee);
  } catch (error) {
    await t.rollback();
    console.error("Error creating employee:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      business_phone,
      ssn,
      user_type_id,
      user_group_id,
      employee_type,
      hire_date,
      last_employment_date,
      certifications,
      status
    } = req.body;

    await employee.update({
      first_name,
      last_name,
      email,
      phone,
      business_phone,
      ssn,
      user_type_id,
      user_group_id,
      employee_type,
      hire_date,
      last_employment_date,
      certifications,
      status
    });

    // Also update linked user if exists
    if (employee.user_id) {
      await User.update({
        first_name,
        last_name,
        email,
        phone,
        user_group: user_group_id,
        user_type: user_type_id,
        status
      }, { where: { id: employee.user_id } });
    }

    const updatedEmployee = await Employee.findByPk(req.params.id, {
      include: includeOptions
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    await employee.destroy();
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const employees = await Employee.findAll({
      where: { status },
      include: includeOptions,
      order: [['created_at', 'DESC']]
    });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees by status:", error);
    res.status(500).json({ message: error.message });
  }
};
