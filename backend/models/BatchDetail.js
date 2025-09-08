const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Batch = require('./Batch');

const BatchDetail = sequelize.define('BatchDetail', {
  batch_detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Batch,
      key: 'batch_id'
    },
    onDelete: 'CASCADE'
  },
  claim_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  claim_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'valid', 'invalid', 'processed'),
    defaultValue: 'pending'
  },  
  claim_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

}, {
  tableName: 'batch_details',
  timestamps: false
});

// Define associations
const Claim = require('./Claim');
BatchDetail.belongsTo(Batch, { foreignKey: 'batch_id' });
BatchDetail.belongsTo(Claim, { foreignKey: 'claim_id' });
Batch.hasMany(BatchDetail, { foreignKey: 'batch_id', as: 'batchDetails' });

module.exports = BatchDetail;
