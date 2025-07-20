import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
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
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.jpeg', 'icons/*.png', 'icons/*.svg'],
        manifest: {
          name: 'StreamSupport - Support the Artists you Stream',
          short_name: 'StreamSupport',
          description: 'Revolutionary Spotify-integrated platform that empowers music fans to support artists through automatic, listening-based monthly budget distribution',
          theme_color: '#a456fb',
          background_color: '#121212',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/favicon.jpeg',
              sizes: '72x72',
              type: 'image/jpeg',
              purpose: 'any'
            },
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg}'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
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
