const { DataTypes } = require("sequelize");
const sequelize = require("../db");

// Import models
const UserGroup = require("./UserGroup");
const UserType = require("./UserType");

const GroupPermission = sequelize.define(
  "GroupPermission",
  {
    group_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user_groups',
        key: 'group_id'
      }
    },
    type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user_types',
        key: 'type_id'
      }
    }
  },
  {
    tableName: 'group_permissions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['group_id', 'type_id']
      }
    ]
  }
);

// Define associations
UserGroup.belongsToMany(UserType, { 
  through: GroupPermission,
  foreignKey: 'group_id',
  otherKey: 'type_id',
  onDelete: 'CASCADE'
});

UserType.belongsToMany(UserGroup, {
  through: GroupPermission,
  foreignKey: 'type_id',
  otherKey: 'group_id',
  onDelete: 'CASCADE'
});

module.exports = GroupPermission; 