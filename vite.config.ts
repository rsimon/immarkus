import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import macros from 'vite-plugin-babel-macros';

export default defineConfig({
  plugins: [react(), macros()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    mainFields: [] // react-moment fails without this!
  },
  define: {
    'process.env': {
      PACKAGE_VERSION: JSON.parse(
        fs.readFileSync('./package.json').toString()
      ).version,
      BUILD_DATE: new Date()
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
          'openseadragon': ['openseadragon']
        }
      }
    }
  }
})
