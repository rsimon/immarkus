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
      },{
        src: 'node_modules/onnxruntime-web/dist/*.wasm',
        dest: 'node_modules/.vite/deps'
      }]
    })
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
        manualChunks(id) {
          // Keep Vite's/Rollup's shared cross-cutting runtime helpers out of the
          // vendor chunks below - otherwise every other chunk that also happens to
          // need the same helper ends up statically importing (and therefore
          // preloading) whichever huge chunk it landed in.
          if (id.includes('vite/preload-helper')) return 'vite-preload-helper';
          if (id.includes('commonjsHelpers')) return 'commonjs-helpers';
          if (id.includes('commonjs-dynamic-modules')) return 'commonjs-helpers';
          if (id.includes('node_modules/@annotorious/react')) return 'dep-annotorious';
          if (id.includes('node_modules/exceljs')) return 'dep-exceljs';
          if (id.includes('node_modules/primereact')) return 'dep-primereact';
          if (id.includes('node_modules/@annotorious/plugin-segment-anything')) return 'dep-sam';
          if (id.includes('node_modules/@annotorious/plugin-magnetic-outline')) return 'dep-opencv';
        },
      },
      external: (source, _, __) => {
        // Suppress warning about missing asset (handled by vite-static-copy)
        return source.includes('/assets/crosshair.svg');
      },
      onwarn: (warning, warn) => {
        if (
          warning.code === 'PLUGIN_WARNING' && 
          warning.plugin === 'vite:resolve' &&
          warning.message.includes('has been externalized for browser compatibility')) {
          return;
        }

        warn(warning);
      }
    }
  }
})
