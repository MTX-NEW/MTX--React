const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const TimeOffRequest = sequelize.define('TimeOffRequest', {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'request_id'
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
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date'
  },
  type: {
    type: DataTypes.ENUM('vacation', 'sick', 'personal', 'other'),
    allowNull: false,
    field: 'type'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'denied'),
    defaultValue: 'pending',
    field: 'status'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes'
  }
}, {
  tableName: 'time_off_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define association with User
TimeOffRequest.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(TimeOffRequest, { foreignKey: 'user_id' });

module.exports = TimeOffRequest; 