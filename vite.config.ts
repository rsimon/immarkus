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
        dest: 'assets',
        rename: { stripBase: true }
      },{
        src: 'node_modules/@annotorious/plugin-segment-anything/dist/assets/*',
        dest: 'assets',
        rename: { stripBase: true }
      },{
        src: 'node_modules/@annotorious/plugin-magnetic-outline/dist/assets/*',
        dest: 'assets',
        rename: { stripBase: true }
      },{
        src: 'node_modules/onnxruntime-web/dist/*.wasm',
        dest: 'node_modules/.vite/deps',
        rename: { stripBase: true }
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
      '@': path.resolve(import.meta.dirname, './src'),
      '@gradio/client': path.resolve('./node_modules/@gradio/client/dist/index.js')
    }
  },
  define: {
    'process.env': {
      PACKAGE_VERSION: JSON.parse(
        fs.readFileSync('./package.json').toString()
      ).version,
      BUILD_DATE: new Date().toISOString()
    }
  },
  build: {
    chunkSizeWarningLimit: 12000,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/immarkus-[hash].js',
        assetFileNames: 'assets/immarkus-[hash].[ext]',
        manualChunks(id, { getModuleInfo }) {
          // CSS side-effect imports resolve to a path under the same package
          // directory as their JS, so the substring checks below would otherwise
          // also sweep them into the huge vendor chunks - forcing whichever page
          // statically imports the (tiny) CSS to also statically depend on the
          // whole chunk. Let Vite's own CSS extraction handle these instead.
          if (id.endsWith('.css')) return;

          // Keep shared cross-cutting runtime helpers (the bundler's own dynamic
          // import/CJS-interop plumbing) out of the vendor chunks below -
          // otherwise every other chunk that also happens to need the same
          // helper ends up statically importing (and therefore preloading)
          // whichever huge chunk it landed in. The exact helper module id(s)
          // have changed across bundler versions (Rollup vs. Rolldown), so this
          // has needed updating before - if dep-sam/dep-opencv start showing up
          // in the root HTML's modulepreload list again after a Vite upgrade,
          // check here first.
          if (id.includes('vite/preload-helper')) return 'vite-preload-helper';
          if (id.includes('commonjsHelpers')) return 'commonjs-helpers';
          if (id.includes('commonjs-dynamic-modules')) return 'commonjs-helpers';
          if (id.includes('rolldown-runtime')) return 'rolldown-runtime';

          // Same reasoning: react-router's internal history/path utilities are
          // used app-wide (every route needs them) but aren't matched by any of
          // the heavyVendors entries below, so the bundler's default chunking
          // left them unassigned - and it chose to physically place them inside
          // dep-opencv (its own biggest chunk) rather than the main entry.
          // Giving router code an explicit home of its own prevents that.
          if (id.includes('node_modules/react-router')) return 'dep-router';

          const heavyVendors = {
            'node_modules/@annotorious/react': 'dep-annotorious',
            'node_modules/exceljs': 'dep-exceljs',
            'node_modules/primereact': 'dep-primereact',
            'node_modules/@annotorious/plugin-segment-anything': 'dep-sam',
            'node_modules/@annotorious/plugin-magnetic-outline': 'dep-opencv'
          };

          for (const [pathFragment, chunkName] of Object.entries(heavyVendors)) {
            if (!id.includes(pathFragment)) continue;

            // Belt and braces: even a module living inside one of these package
            // folders might, at the bundler's discretion, turn out to be a small
            // shared utility that unrelated code elsewhere also imports (this is
            // exactly how dep-sam/dep-opencv have twice ended up eagerly loaded
            // on every route, despite Annotate itself being lazy-loaded - the
            // bundler physically placed a bit of genuinely shared code inside the
            // vendor chunk and made everyone else import it from there). A
            // package's own entry point is always "imported from outside" (that's
            // just what importing it means), so only exempt SMALL modules that
            // are also imported from elsewhere - the actual multi-MB WASM/engine
            // code never matches "small", so this can't misfire on the real payload.
            const info = getModuleInfo(id);
            const isSmall = (info?.code?.length ?? Infinity) < 5_000;
            const importedFromOutside = isSmall && info?.importers?.some(
              importer => !importer.includes(pathFragment)
            );

            return importedFromOutside ? undefined : chunkName;
          }
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
