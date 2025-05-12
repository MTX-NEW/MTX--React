const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const TripMember = require("./TripMember");
const User = require("./User");

const Trip = sequelize.define(
  "Trip",
  {
    trip_id: {
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
    trip_type: {
      type: DataTypes.ENUM('one_way', 'round_trip', 'multi_stop'),
      allowNull: false,
      defaultValue: 'one_way',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    schedule_type: {
      type: DataTypes.ENUM('Immediate', 'Once', 'Blanket'),
      allowNull: false,
      defaultValue: 'Once',
    },
    schedule_days: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_distance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('total_distance');
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
    tableName: "trips",
    timestamps: false,
  }
);

// Define relationships - REMOVE these as they're in associations.js
// Trip.belongsTo(TripMember, { foreignKey: "member_id" });
// Trip.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// TripLegs relationship is defined in associations.js
// Trip.hasMany(TripLeg, { foreignKey: "trip_id", as: "legs" });

module.exports = Trip; 