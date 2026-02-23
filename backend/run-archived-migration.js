'use strict';

const path = require('path');
// Load .env from project root (same as server.js) so DB credentials match
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const sequelize = require('./db');
const migration = require('./migrations/add-archived-at-to-users');
const { Sequelize } = require('sequelize');

migration
  .up(sequelize.getQueryInterface(), Sequelize)
  .then(() => {
    console.log('Migration add-archived-at-to-users completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
