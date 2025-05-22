const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Incentive = sequelize.define('Incentive', {
  incentive_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'incentive_id'
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date'
  }
}, {
  tableName: 'incentives',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Incentive; 