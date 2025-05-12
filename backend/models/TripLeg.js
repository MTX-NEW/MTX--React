const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Trip = require("./Trip");
const User = require("./User");
const TripLocation = require("./TripLocation");

const TripLeg = sequelize.define(
  "TripLeg",
  {
    leg_id: {
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
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        'Scheduled',
        'Attention',
        'Assigned',
        'Transport confirmed',
        'Transport enroute',
        'Picked up',
        'Not going',
        'Not available',
        'Dropped off',
        'Cancelled'
      ),
      defaultValue: 'Scheduled',
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
    scheduled_pickup: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    actual_pickup: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    scheduled_dropoff: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    actual_dropoff: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    pickup_odometer: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('pickup_odometer');
        return value === null ? null : parseFloat(value);
      }
    },
    dropoff_odometer: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('dropoff_odometer');
        return value === null ? null : parseFloat(value);
      }
    },
    leg_distance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('leg_distance');
        return value === null ? null : parseFloat(value);
      }
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: "trip_legs",
    timestamps: false,
  }
);

module.exports = TripLeg; 