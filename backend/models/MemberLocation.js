const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const MemberLocation = sequelize.define(
  "MemberLocation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "trip_members",
        key: "member_id",
      },
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "trip_locations",
        key: "location_id",
      },
    },
    is_primary_pickup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_primary_dropoff: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    location_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Optional nickname for this location (e.g., "Home", "Work", "Doctor")',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "member_locations",
    timestamps: false,
  }
);

module.exports = MemberLocation; 