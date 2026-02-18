/**
 * Simple migration runner script
 * Usage: node run-migration.js <migration-name>
 * Example: node run-migration.js add-website-address-to-user-groups
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const sequelize = require('./db');
const path = require('path');

async function runMigration() {
  const migrationName = process.argv[2];
  
  if (!migrationName) {
    console.log('Usage: node run-migration.js <migration-name>');
    console.log('Example: node run-migration.js add-website-address-to-user-groups');
    process.exit(1);
  }

  try {
    console.log(`Running migration: ${migrationName}`);
    
    const migration = require(`./migrations/${migrationName}`);
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = require('sequelize');

    await migration.up(queryInterface, Sequelize);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    
    // Check if it's because columns already exist
    if (error.message.includes('Duplicate column name')) {
      console.log('Columns may already exist. Migration may have been run before.');
    }
    
    process.exit(1);
  }
}

runMigration();
