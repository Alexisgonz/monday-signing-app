import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as dotenv from 'dotenv'

dotenv.config() // lee MONDAY_TOKEN

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para GraphQL de Monday
      '/monday': {
        target: 'https://api.monday.com/v2',
        changeOrigin: true,
        secure: true, // TLS verificado
        rewrite: p => p.replace(/^\/monday/, ''),
        headers: {
          // <- se agrega desde el servidor de Vite (no viaja al browser)
          Authorization: process.env.MONDAY_TOKEN || ''
        }
      },
    }
  }
})
