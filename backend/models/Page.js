const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Page = sequelize.define(
  "Page",
  {
    page_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    page_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    page_path: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    page_section: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  },
  {
    tableName: 'pages',
    timestamps: false
  }
);

module.exports = Page; 