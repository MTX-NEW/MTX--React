const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./User");

const Vehicle = sequelize.define(
  "Vehicle",
  {
    vehicle_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mtx_unit: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    make: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Ambulatory', 'Wheelchair'),
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.ENUM('Sedan', 'Van', 'SUV'),
      allowNull: false,
    },
    plate_number: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    tyre_size: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    vin: {
      type: DataTypes.STRING(17),
      unique: true,
      allowNull: false,
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    registration_due: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    last_registered: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    assigned_ts: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      },
      get() {
        const rawValue = this.getDataValue('assigned_ts');
        return rawValue ? Number(rawValue) : null;
      }
    },
    date_assigned: {
      type: DataTypes.DATEONLY,
    },
    insured_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    insured_to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive', 'Maintenance'),
      defaultValue: 'Active',
    }
  },
  {
    tableName: 'vehicles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Association with User model
Vehicle.belongsTo(User, {
  foreignKey: 'assigned_ts',
  as: 'assigned_user'
});

module.exports = Vehicle; 