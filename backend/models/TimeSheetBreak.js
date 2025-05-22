const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const TimeSheet = require('./TimeSheet');

const TimeSheetBreak = sequelize.define('TimeSheetBreak', {
  break_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'break_id'
  },
  timesheet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'timesheet_id',
    references: {
      model: 'timesheets',
      key: 'timesheet_id'
    }
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_time'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_time'
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'duration_minutes'
  },
  type: {
    type: DataTypes.ENUM('lunch', 'break', 'other'),
    defaultValue: 'break',
    field: 'type'
  }
}, {
  tableName: 'timesheet_breaks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// The associations will be defined in the index.js to avoid circular dependencies
module.exports = TimeSheetBreak; 