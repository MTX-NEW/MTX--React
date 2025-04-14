const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const TripSpecialInstruction = sequelize.define(
  "TripSpecialInstruction",
  {
    instruction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "trips",
        key: "trip_id",
      },
    },
    mobility_type: {
      type: DataTypes.ENUM('Wheel Chair', 'Ambulatory'),
      allowNull: false,
      defaultValue: 'Ambulatory',
    },
    rides_alone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    spanish_speaking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    males_only: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    females_only: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    special_assist: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pickup_time_exact: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    stay_with_client: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    car_seat: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    extra_person: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    call_first: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    knock: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    van: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sedan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: "trip_special_instructions",
    timestamps: false,
  }
);

module.exports = TripSpecialInstruction; 