import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import macros from 'vite-plugin-babel-macros';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(), 
    macros(),
    tailwindcss(),
    viteStaticCopy({
      targets: [{
        src: 'node_modules/browser-image-compression/dist/browser-image-compression.js',
        dest: 'assets'
      },{
        src: 'node_modules/@annotorious/plugin-segment-anything/dist/assets/*',
        dest: 'assets'
      },{
        src: 'node_modules/@annotorious/plugin-magnetic-outline/dist/assets/*',
        dest: 'assets'
      }]
    }),
  ],
  server: {
    proxy: {
      '/api/web/clc-sinonom/': {
        target: 'https://kimhannom.clc.hcmus.edu.vn',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@gradio/client': path.resolve('./node_modules/@gradio/client/dist/index.js')
    }
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
    chunkSizeWarningLimit: 12000,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/immarkus-[hash].js',
        assetFileNames: 'assets/immarkus-[hash].[ext]',
        manualChunks: {
          'dep-annotorious': ['@annotorious/react'],
          'dep-exceljs': ['exceljs/dist/exceljs.min.js'],
          'dep-primereact': ['primereact/treetable'],
          'dep-sam': ['@annotorious/plugin-segment-anything'],
          'dep-opencv': ['@annotorious/plugin-magnetic-outline']
        }
      }
    }
  }
})
