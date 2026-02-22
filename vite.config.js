import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', '935da50fdf55.ngrok-free.app', 'd00d557a7396.ngrok-free.app']
  },
})
