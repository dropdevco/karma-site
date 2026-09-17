import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  // Vite only inlines env vars into the client bundle when their name matches
  // one of these prefixes. SUPABASE_URL/SUPABASE_ANON_KEY are stored without
  // the conventional VITE_ prefix in Vercel, so that prefix is added here to
  // match. This does not make either value private — this is a static SPA
  // with no server, so the Supabase client (and therefore this URL and key)
  // runs entirely in the visitor's browser regardless of naming. Never store
  // a value that must stay secret (e.g. a service role key) under a prefix
  // listed here.
  envPrefix: ['VITE_', 'SUPABASE_'],
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png', 'brand/*.webp'],
      manifest: {
        name: 'Karma',
        short_name: 'Karma',
        description: 'Recreational sports that feed families.',
        theme_color: '#ad0000',
        background_color: '#faf7f2',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The staff scanner has to boot with no signal, so the shell is
        // precached and unknown routes fall back to it.
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,woff2,png,webp,svg}'],
        // Never serve a cached answer for data: a stale roster or a stale
        // check-in response would be worse than an honest failure.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
