import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'منصة فرع غرب الدمام',
        short_name: 'غرب الدمام',
        description: 'منصة إدارة حلقات القرآن الكريم - فرع غرب الدمام',
        theme_color: '#60a5fa',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/g/',
        scope: '/g/',
        icons: [
          {
            src: 'data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3e%3ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%2360a5fa\'/%3e%3cg transform=\'translate(35,35) scale(1.25)\'%3e%3cpath d=\'M12 7v14\' stroke=\'%23065f46\' stroke-width=\'2\' stroke-linecap=\'round\'/%3e%3cpath d=\'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\' stroke=\'%23065f46\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' fill=\'none\'/%3e%3c/g%3e%3c/svg%3e',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3e%3ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%2360a5fa\'/%3e%3cg transform=\'translate(35,35) scale(1.25)\'%3e%3cpath d=\'M12 7v14\' stroke=\'%23065f46\' stroke-width=\'2\' stroke-linecap=\'round\'/%3e%3cpath d=\'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\' stroke=\'%23065f46\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' fill=\'none\'/%3e%3c/g%3e%3c/svg%3e',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ],
        categories: ['education', 'productivity', 'utilities'],
        lang: 'ar',
        dir: 'rtl'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/7alaqat\.com\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 دقائق
              },
            },
          },
        ],
      },
    })
  ],
  base: '/g/',
  build: {
    outDir: '../public/g',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
