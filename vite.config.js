import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Cursor hosting serves at the app root; GitHub Pages can override with VITE_BASE
  base: process.env.VITE_BASE || '/',
})
