const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Claim = require("./Claim");
const TripLeg = require("./TripLeg");

const ClaimCharge = sequelize.define(
  "ClaimCharge",
  {
    charge_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    claim_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "claims",
        key: "claim_id",
      },
    },
    trip_leg_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "trip_legs",
        key: "leg_id",
      },
    },
    charge_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    cpt_code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    modifier_1: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    modifier_2: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    modifier_3: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    modifier_4: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    units: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    charge_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('charge_amount');
        return value === null ? null : parseFloat(value);
      }
    },
    diagnosis_pointer: {
      type: DataTypes.STRING(4),
      defaultValue: '1'
    },
    service_from_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    service_to_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    service_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    place_of_service: {
      type: DataTypes.STRING(2),
      defaultValue: '41' // Ambulance - Land
    },
    ndc_number: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
    ndc_unit: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      get() {
        const value = this.getDataValue('ndc_unit');
        return value === null ? null : parseFloat(value);
      }
    },
    ndc_qualifier_code: {
      type: DataTypes.STRING(2),
      allowNull: true
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
    tableName: "claims_charges",
    timestamps: false,
  }
);

module.exports = ClaimCharge;
