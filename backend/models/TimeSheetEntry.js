const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const TimeSheet = sequelize.define('TimeSheet', {
  timesheet_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'timesheet_id'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date'
  },
  clock_in: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'clock_in'
  },
  clock_out: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'clock_out'
  },
  total_regular_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'total_regular_hours'
  },
  total_overtime_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'total_overtime_hours'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'draft',
    field: 'status'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes'
  }
}, {
  tableName: 'timesheets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define association with User - REMOVED and moved to associations.js
// TimeSheet.belongsTo(User, { foreignKey: 'user_id' });
// User.hasMany(TimeSheet, { foreignKey: 'user_id' });

module.exports = TimeSheet; 