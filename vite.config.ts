import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['better-sqlite3'],
            },
          },
        },
      },
    ]),
    renderer(),
    {
      name: 'copy-preload',
      buildStart() {
        // 在开发模式下复制 preload.cjs
        const src = path.resolve(__dirname, 'electron/preload.cjs');
        const dest = path.resolve(__dirname, 'dist-electron/preload.cjs');
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'electron',
        'better-sqlite3',
      ],
    },
  },
  server: {
    port: 5173,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['electron', 'better-sqlite3'],
  },
});
