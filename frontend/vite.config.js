import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path';

// Load env from the root directory
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` from project root
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  
  return {
    plugins: [react(), tsconfigPaths()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    optimizeDeps: {
      force: true, // Force dependencies to be re-optimized on startup
      include: ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons']
    },
    server: {
      host: true,
      port: 3000,
      // Expose variables in frontend using VITE_ prefix
      define: {
        'process.env.VITE_API_URL': JSON.stringify(rootEnv.VITE_API_URL),
      },
      allowedHosts: [
        'react.medtransexpress.com',
        'www.react.medtransexpress.com',
      ],
      headers: {
        // Add CORS headers for font files
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      }
    },
    build: {
      outDir: 'dist',
      // Configure proper handling for font files
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'fa-icons': ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons']
          }
        }
      },
      // Ensure static assets like fonts are properly handled
      assetsInlineLimit: 0
    },
  };
});