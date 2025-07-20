import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { loadEnv } from 'vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  const rootDir = resolve(__dirname, '..');

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          exportType: 'default',
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: '**/*.svg',
      })
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      hmr: {
        // protocol: "wss", // Force secure WebSocket protocol
        path: '/vite-hmr', // The default HMR path used by Vite
      },
      proxy: {
        '/api': 'http://localhost:3000',
      },
      fs: {
        allow: [
          '..',  // Allow parent directory
          './src/**/*.ts',  // Allow TypeScript files in frontend src
          './src/**/*.tsx'  // Allow TypeScript React files in frontend src
        ],
        deny: [
          '../backend/**/*.ts',  // Deny TypeScript files in backend
          '../backend/**/*.tsx'  // Deny TypeScript React files in backend
        ]
      }
    },
    build: {
      outDir: resolve(rootDir, 'backend/frontend-dist'),
    },
    define: {
      // Make all env variables available as process.env
      'process.env': { ...process.env, ...env },
    },
  };
});
