import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/moodle-api': {
        target: 'https://lms.snuchennai.edu.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/moodle-api/, ''),
        secure: true,
      },
      '/umis-api': {
        target: 'https://umisapi.tnega.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/umis-api/, ''),
        secure: true,
      },

    },
  },
})