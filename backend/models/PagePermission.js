const { DataTypes } = require("sequelize");
const sequelize = require("../db");

// Import models
const UserType = require("./UserType");

const PagePermission = sequelize.define(
  "PagePermission",
  {
    page_name: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user_types',
        key: 'type_id'
      }
    },

    can_view: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    can_edit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'page_permissions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['page_name', 'type_id']
      }
    ]
  }
);


UserType.belongsToMany(
  sequelize.define(
    'Page',
    {
      page_name: {
        type: DataTypes.STRING(50),
        primaryKey: true
      }
    },
    { tableName: 'pages', timestamps: false }
  ),
  {
    through: PagePermission,
    foreignKey: 'type_id',
    otherKey: 'page_name'
  }
);

module.exports = PagePermission;
