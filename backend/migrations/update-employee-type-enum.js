const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // First, update any existing data to valid values
    await queryInterface.sequelize.query(
      `UPDATE employees SET employee_type = 'Salary' WHERE employee_type IN ('Full Time', 'Contract') OR employee_type IS NULL`
    );
    await queryInterface.sequelize.query(
      `UPDATE employees SET employee_type = 'Hourly' WHERE employee_type IN ('Part Time', 'Temporary', 'Intern')`
    );

    // Then alter the column to the new ENUM
    await queryInterface.changeColumn('employees', 'employee_type', {
      type: DataTypes.ENUM('Salary', 'Hourly'),
      allowNull: true,
      defaultValue: 'Salary',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.changeColumn('employees', 'employee_type', {
      type: DataTypes.ENUM('Full Time', 'Part Time', 'Contract', 'Temporary', 'Intern'),
      allowNull: true,
      defaultValue: 'Full Time',
    });
  }
};
