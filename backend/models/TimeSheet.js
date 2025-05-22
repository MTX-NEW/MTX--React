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
  total_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'total_hours'
  },
  hour_type: {
    type: DataTypes.ENUM('regular', 'driving', 'over_time', 'administrative', 'incentive'),
    allowNull: false,
    field: 'hour_type',
    defaultValue: 'regular'
  },
  rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'rate'
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
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
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (timeSheet) => {
      if (!timeSheet.hour_type) {
        timeSheet.hour_type = 'regular';
      }
      
      // Set rate from user if available
      if (timeSheet.user_id && timeSheet.rate === 0) {
        const User = require('./User');
        const user = await User.findByPk(timeSheet.user_id);
        if (user) {
          timeSheet.rate = user.hourly_rate || 0;
        }
      }
    }
  }
});

// Define association with User - REMOVED and moved to associations.js
// TimeSheet.belongsTo(User, { foreignKey: 'user_id' });
// User.hasMany(TimeSheet, { foreignKey: 'user_id' });

module.exports = TimeSheet; 