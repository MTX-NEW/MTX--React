/**
 * Run all migrations listed in migrations/order.txt (in order).
 * Only runs migrations that haven't been executed yet (tracked in SequelizeMeta table).
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
const META_TABLE = 'SequelizeMeta';

async function ensureMetaTable(queryInterface) {
  const [tables] = await sequelize.query("SHOW TABLES LIKE '" + META_TABLE + "'");
  if (tables.length === 0) {
    await queryInterface.createTable(META_TABLE, {
      name: {
        type: Sequelize.STRING(255),
        primaryKey: true,
        allowNull: false
      }
    });
    console.log(`Created ${META_TABLE} table for migration tracking.`);
  }
}

async function hasRunMigration(name) {
  const [results] = await sequelize.query(
    `SELECT name FROM ${META_TABLE} WHERE name = :name`,
    { replacements: { name } }
  );
  return results.length > 0;
}

async function recordMigration(name) {
  await sequelize.query(
    `INSERT INTO ${META_TABLE} (name) VALUES (:name)`,
    { replacements: { name } }
  );
}

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
  await ensureMetaTable(queryInterface);

  let runCount = 0;
  let skippedCount = 0;

  for (const name of order) {
    // Check if migration already ran
    if (await hasRunMigration(name)) {
      console.log(`Skipping ${name}: already executed.`);
      skippedCount++;
      continue;
    }

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
      await recordMigration(name);
      console.log(`  ✓ Done: ${name}`);
      runCount++;
    } catch (err) {
      console.error(`Migration failed: ${name}`, err.message);
      process.exit(1);
    }
  }

  console.log(`\nMigration summary: ${runCount} ran, ${skippedCount} skipped.`);
  if (runCount === 0 && skippedCount > 0) {
    console.log('All migrations are up to date!');
  }
  process.exit(0);
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
