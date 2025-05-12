const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const UserType = sequelize.define(
  "UserType",
  {
    type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type_name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    display_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      defaultValue: 'Active',
    }
  },
  {
    tableName: 'user_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = UserType; 