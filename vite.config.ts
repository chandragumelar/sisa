import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(Date.now().toString()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null, // useRegisterSW in UpdateBanner handles registration
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/(api|_)/],
        runtimeCaching: [
          {
            // Google Fonts — cache-first
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: 'SISA',
        short_name: 'SISA',
        description: 'Aman ga gue beli ini sekarang?',
        theme_color: '#F2EDE3',
        background_color: '#F2EDE3',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'id',
        icons: [
          {
            src: '/sisa-logo/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/sisa-logo/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/sisa-logo/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/sisa-logo/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
})
