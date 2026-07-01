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
    modulePreload: {
      // By default, Vite also preloads a chunk's *nested* dynamic imports as
      // soon as its container chunk is loaded, to avoid a request waterfall.
      // That's wrong for dep-sam/dep-opencv: Annotate.tsx only imports them
      // conditionally (once the user opens Smart Tools / picks the magnetic
      // outline tool), so preloading them just for visiting /annotate defeats
      // the point of deferring them - strip them from every preload list and
      // let their own dynamic import() fetch them on demand instead.
      resolveDependencies: (_filename, deps) =>
        deps.filter(dep => !dep.includes('dep-sam-') && !dep.includes('dep-opencv-'))
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/immarkus-[hash].js',
        assetFileNames: 'assets/immarkus-[hash].[ext]',
        manualChunks(id) {
          // CSS side-effect imports (e.g. the SAM/magnetic-outline plugin
          // stylesheets) resolve to a path under the same package directory as
          // their JS, so the substring checks below would otherwise also sweep
          // them into the huge vendor chunks - forcing whichever page statically
          // imports the (tiny) CSS to also statically depend on the whole chunk.
          // Let Vite's own CSS extraction handle these instead.
          if (id.endsWith('.css')) return;

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
