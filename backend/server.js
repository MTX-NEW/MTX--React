require('dotenv').config();
const app = require('./app');
const sequelize = require('./db');

// Import all models to ensure they are initialized
require('./models');

// Import and setup associations
const { setupAssociations } = require('./models/associations');
setupAssociations();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Sync all models with the database
    await sequelize.sync();
    console.log('Database synced successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
