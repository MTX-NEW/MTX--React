const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // First, update any existing data to valid values (safe to run multiple times)
    try {
      await queryInterface.sequelize.query(
        `UPDATE employees SET employee_type = 'Salary' WHERE employee_type IN ('Full Time', 'Contract') OR employee_type IS NULL`
      );
      await queryInterface.sequelize.query(
        `UPDATE employees SET employee_type = 'Hourly' WHERE employee_type IN ('Part Time', 'Temporary', 'Intern')`
      );
    } catch (err) {
      // Table or column might not exist, ignore
      if (err.message.includes("doesn't exist") || err.message.includes('Unknown column')) return;
      throw err;
    }

    // Then alter the column to the new ENUM
    try {
      await queryInterface.changeColumn('employees', 'employee_type', {
        type: DataTypes.ENUM('Salary', 'Hourly'),
        allowNull: true,
        defaultValue: 'Salary',
      });
    } catch (err) {
      // Column might already be in the correct state or not exist, ignore
      if (err.message.includes("doesn't exist") || err.message.includes('Unknown column')) return;
      // If enum is already correct, that's fine too
      if (err.message.includes('already') || err.message.includes('Duplicate')) return;
      throw err;
    }
  },

  down: async (queryInterface) => {
    await queryInterface.changeColumn('employees', 'employee_type', {
      type: DataTypes.ENUM('Full Time', 'Part Time', 'Contract', 'Temporary', 'Intern'),
      allowNull: true,
      defaultValue: 'Full Time',
    });
  }
};
