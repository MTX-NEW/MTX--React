const fs = require('fs');
const path = require('path');

// Single consolidated .env file content
const envContent = `# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password123
MYSQL_DB=mtx

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_change_this
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend Configuration
VITE_API_URL=http://localhost:5000
`;

// Write main .env file
fs.writeFileSync(path.join(__dirname, '.env'), envContent);
console.log('✅ Main .env file created successfully');

console.log('Environment setup complete!');
console.log('To start the application:');
console.log('1. Run "npm run install-all" to install all dependencies');
console.log('2. Run "npm run dev" to start both frontend and backend servers'); 