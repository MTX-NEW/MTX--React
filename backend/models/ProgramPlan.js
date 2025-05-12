const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ProgramPlan = sequelize.define(
  "ProgramPlan",
  {
    plan_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'programs',
        key: 'program_id',
      },
    },
    plan_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'program_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = ProgramPlan;
