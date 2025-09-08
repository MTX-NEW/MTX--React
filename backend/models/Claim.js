const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Trip = require("./Trip");
const User = require("./User");

const Claim = sequelize.define(
  "Claim",
  {
    claim_id: {
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
    claim_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    patient_control_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'generated', 'submitted', 'accepted', 'rejected', 'paid'),
      defaultValue: 'pending'
    },
    claim_frequency: {
      type: DataTypes.STRING(1),
      defaultValue: '1' // 1 = original
    },
    total_charge_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('total_charge_amount');
        return value === null ? null : parseFloat(value);
      }
    },
    place_of_service: {
      type: DataTypes.STRING(2),
      defaultValue: '41' // Ambulance - Land
    },
    facility_code_value: {
      type: DataTypes.STRING(2),
      defaultValue: '81'
    },
    service_from_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    service_to_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    billing_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    edi_file_path: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    generated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
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
    tableName: "claims",
    timestamps: false,
  }
);

module.exports = Claim;
