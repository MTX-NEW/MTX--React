/**
 * Run all migrations listed in migrations/order.txt (in order).
 * Usage: from repo root: node backend/run-all-migrations.js
 *        or from backend:  node run-all-migrations.js
 * Requires .env in repo root with DB credentials.
 */

const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const sequelize = require('./db');
const Sequelize = require('sequelize');

const orderPath = path.join(__dirname, 'migrations', 'order.txt');

function getOrder() {
  if (!fs.existsSync(orderPath)) {
    console.log('No migrations/order.txt found; skipping migrations.');
    return [];
  }
  const content = fs.readFileSync(orderPath, 'utf8');
  return content
    .split('\n')
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean);
}

async function runAll() {
  const order = getOrder();
  if (order.length === 0) {
    console.log('No migrations to run.');
    process.exit(0);
  }

  const queryInterface = sequelize.getQueryInterface();

  for (const name of order) {
    let migration;
    try {
      migration = require(path.join(__dirname, 'migrations', name));
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        console.log(`Skipping ${name}: migration file not found.`);
        continue;
      }
      throw e;
    }

    if (!migration.up) {
      console.log(`Skipping ${name}: no up() export.`);
      continue;
    }

    try {
      console.log(`Running migration: ${name}`);
      await migration.up(queryInterface, Sequelize);
      console.log(`  Done: ${name}`);
    } catch (err) {
      console.error(`Migration failed: ${name}`, err.message);
      process.exit(1);
    }
  }

  console.log('All migrations completed.');
  process.exit(0);
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
