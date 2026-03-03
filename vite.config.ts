import { defineConfig } from 'vite';
import { resolve } from 'path';

const isIIFE = process.env.BUILD_FORMAT === 'iife';

export default defineConfig({
  build: {
    outDir: isIIFE ? 'dist/cdn' : 'dist',
    emptyOutDir: false,
    lib: isIIFE ? {
      // CDN bundle (IIFE)
      entry: resolve(__dirname, 'src/cdn.ts'),
      name: 'Trame',
      formats: ['iife'],
      fileName: () => 'trame-widget.js',
    } : {
      // NPM bundle (ESM + CJS)
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TrameWidget',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') return 'index.mjs';
        if (format === 'cjs') return 'index.cjs';
        return 'index.js';
      },
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
