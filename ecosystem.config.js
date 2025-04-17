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
      args: 'run dev',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}; 