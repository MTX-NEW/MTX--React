const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const PagePermission = sequelize.define(
  "PagePermission",
  {
    permission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    page_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pages',
        key: 'page_id'
      }
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user_types',
        key: 'type_id'
      }
    },
    can_view: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    can_edit: {
      type: DataTypes.BOOLEAN, 
      allowNull: true,
      defaultValue: 0
    }
  },
  {
    tableName: 'page_permissions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['page_id', 'type_id']
      }
    ]
  }
);

module.exports = PagePermission;
