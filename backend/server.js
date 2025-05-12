// Load .env from the root directory
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const app = require('./app');
const sequelize = require('./db');

// Import all models to ensure they are initialized
require('./models');

// Import and setup associations
const { setupAssociations } = require('./models/associations');
setupAssociations();

// Use environment variables with fallbacks
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Log DB connection information (without passwords)
    console.log(`Connecting to MySQL database: ${process.env.MYSQL_DB} at ${process.env.MYSQL_HOST}`);
    
    // Sync all models with the database
    await sequelize.sync();
    console.log('Database synced successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
