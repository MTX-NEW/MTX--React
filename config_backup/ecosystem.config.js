
module.exports = {
  apps: [
    {
      name: 'mtx-backend',
      cwd: './backend',
      script: 'server.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'mtx-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}; 
