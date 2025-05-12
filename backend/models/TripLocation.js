const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const TripLocation = sequelize.define(
  "TripLocation",
  {
    location_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    street_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    building: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    building_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    location_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    recipient_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('latitude');
        return value === null ? null : parseFloat(value);
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('longitude');
        return value === null ? null : parseFloat(value);
      }
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
    tableName: "trip_locations",
    timestamps: false,
  }
);

module.exports = TripLocation; 