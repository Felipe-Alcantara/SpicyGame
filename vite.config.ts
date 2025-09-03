import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/SpicyGame/',
  build: { outDir: 'docs' },
  plugins: [react()]
})
