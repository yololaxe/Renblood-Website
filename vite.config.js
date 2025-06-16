import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  // Base URL pour le déploiement (ajustez si besoin)
  base: '/',

  // Dossier où sont servies/recopiées toutes les resources statiques "as-is"
  publicDir: 'public', // Default chez Vite :contentReference[oaicite:0]{index=0}

  resolve: {
    alias: {
      // Simplifie vos imports : import X from '@/components/X'
      '@': path.resolve(__dirname, 'src'),
      // Pour accéder facilement aux assets de public
      '@assets': path.resolve(__dirname, 'public/assets'),
    }
  },

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      // Précache tous vos PNG dans publicDir + robots.txt, favicon...
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'icons/**/*.png',
      ], // :contentReference[oaicite:1]{index=1}

      // Vous pouvez maintenir un manifest.json séparé sous public/
      // ou redéfinir directement votre manifest ici :
      manifest: {
        name: 'Renblood Website',
        short_name: 'Renblood',
        description: 'Site officiel du serveur Minecraft semi-RP Renblood',
        lang: 'fr-FR',
        start_url: '.',
        display: 'standalone',
        theme_color: '#1e1e1e',
        background_color: '#ffffff',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          // ajoutez ici toutes les tailles dont vous avez besoin
        ]
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],

  server: {
    port: 5173,
    open: true,
  },

  build: {
    // Tous les assets générés iront dans /dist/assets/ nommés [name].[hash][ext]
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  }
});
