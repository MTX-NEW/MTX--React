# Med Trans Express

A comprehensive application for managing medical transportation services.

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MySQL (v8 or higher)

### Initial Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd mtx
   ```

2. Set up environment variables
   ```
   npm run setup
   ```
   This will create a single `.env` file in the root directory with all necessary configuration. You may need to modify this file with your specific settings.

3. Install dependencies
   ```
   npm run install-all
   ```

4. Create the database
   ```
   mysql -u root -p
   ```
   
   In MySQL shell:
   ```sql
   CREATE DATABASE mtx;
   EXIT;
   ```

5. Import the database schema (optional if you want to start with sample data)
   ```
   mysql -u root -p mtx < mtx.sql
   ```

### Running the Application

Start both frontend and backend with a single command:
```
npm run dev
```

This will start:
- Backend API server at http://localhost:5000
- Frontend development server at http://localhost:3000

### Available Commands

- `npm run setup` - Set up environment file
- `npm run install-all` - Install all dependencies
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server (backend only) 

