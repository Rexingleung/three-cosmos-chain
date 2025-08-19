import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    cors: true
  },
  define: {
    global: 'globalThis'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})