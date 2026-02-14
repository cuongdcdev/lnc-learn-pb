import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Do not wipe previous build (index/background)
    lib: {
      entry: resolve(__dirname, 'src/content.tsx'),
      name: 'ContentScript',
      fileName: () => 'src/content.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        // Ensure no globals are expected, bundle everything
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
