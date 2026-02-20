const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('employees', {
      employee_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      emp_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      business_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      ssn: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      user_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'user_types',
          key: 'type_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      user_group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'user_groups',
          key: 'group_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      employee_type: {
        type: DataTypes.ENUM('Salary', 'Hourly'),
        allowNull: true,
        defaultValue: 'Salary',
      },
      hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      last_employment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      certifications: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Terminated', 'On Leave'),
        defaultValue: 'Active',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      }
    });

    // Add indexes
    await queryInterface.addIndex('employees', ['emp_id'], { unique: true });
    await queryInterface.addIndex('employees', ['user_id']);
    await queryInterface.addIndex('employees', ['status']);
    await queryInterface.addIndex('employees', ['user_type_id']);
    await queryInterface.addIndex('employees', ['user_group_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('employees');
  }
};
