import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import macros from 'vite-plugin-babel-macros';

export default defineConfig({
  plugins: [react(), macros()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      external: [
        'chart.js/auto',
        'quill'
      ],
      output: {
        manualChunks: {
          'openseadragon': ['openseadragon'],
          'primereact': ['primereact']
        }
      }
    }
  }
})
