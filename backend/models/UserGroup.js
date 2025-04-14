const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const UserGroup = sequelize.define(
  "UserGroup",
  {
    group_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    common_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    short_name: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    parent_group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    auto_routing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    send_pdf: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
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
    tableName: 'user_groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Self-referential relationship
UserGroup.belongsTo(UserGroup, { as: 'parentGroup', foreignKey: 'parent_group_id' });

module.exports = UserGroup; 