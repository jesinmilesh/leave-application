import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listen on 0.0.0.0 (all network interfaces: localhost, 127.0.0.1, LAN)
    port: 5173,
    strictPort: false
  }
})


