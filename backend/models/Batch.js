// models/Batch.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Batch = sequelize.define('Batch', {
  batch_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  batch_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'partial'),
    defaultValue: 'pending'
  },
  total_claims: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  edi_file_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'batch',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Batch;
