import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/bmrs-api': {
        target: 'https://data.elexon.co.uk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bmrs-api/, '/bmrs/api/v1'),
      },
    },
  },
})
