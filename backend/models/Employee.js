const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./User");
const UserType = require("./UserType");
const UserGroup = require("./UserGroup");

const generateEmpId = async () => {
  const [results] = await sequelize.query(
    "SELECT emp_id FROM employees ORDER BY employee_id DESC LIMIT 1"
  );
  if (results.length === 0) {
    return 'EMP0001';
  }
  const lastEmpId = results[0].emp_id;
  const numPart = parseInt(lastEmpId.replace('EMP', ''), 10);
  return `EMP${String(numPart + 1).padStart(4, '0')}`;
};

const Employee = sequelize.define(
  "Employee",
  {
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
      comment: 'Link to user account if exists',
    },
    emp_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'Display employee ID (e.g., EMP001)',
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
      comment: 'Social Security Number (encrypted)',
    },
    user_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user_types',
        key: 'type_id',
      },
    },
    user_group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user_groups',
        key: 'group_id',
      },
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
      comment: 'Array of certification objects',
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
  },
  {
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (employee) => {
        if (!employee.emp_id) {
          employee.emp_id = await generateEmpId();
        }
      }
    }
  }
);

Employee.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Employee.belongsTo(UserType, { foreignKey: 'user_type_id', as: 'UserType' });
Employee.belongsTo(UserGroup, { foreignKey: 'user_group_id', as: 'Organisation' });

module.exports = Employee;
