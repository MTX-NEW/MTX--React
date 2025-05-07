import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: {
      clientPort: 80,
      host: 'react.medtransexpress.com'
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://react.medtransexpress.com:5000',
        changeOrigin: true,
      },
    },
    strictPort: true,
    allowedHosts: ['localhost', 'react.medtransexpress.com', '167.71.153.164'],
  },
  build: {
    outDir: 'dist',
  },
});