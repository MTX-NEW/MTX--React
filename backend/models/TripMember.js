const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Program = require("./Program");
const TripLocation = require("./TripLocation");

const TripMember = sequelize.define(
  "TripMember",
  {
    member_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "programs",
        key: "program_id",
      },
    },
    ahcccs_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    insurance_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    pickup_location: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "trip_locations",
        key: "location_id",
      },
    },
    dropoff_location: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "trip_locations",
        key: "location_id",
      },
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded signature image',
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
    tableName: "trip_members",
    timestamps: false,
  }
);

// Association definitions are now in models/associations.js
// TripMember.belongsTo(Program, { foreignKey: "program_id" });
// TripMember.belongsTo(TripLocation, { foreignKey: "pickup_location", as: "pickupLocation" });
// TripMember.belongsTo(TripLocation, { foreignKey: "dropoff_location", as: "dropoffLocation" });

module.exports = TripMember; 