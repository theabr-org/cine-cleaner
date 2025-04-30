import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [solid(), tailwindcss()],
  optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/utils'] },
  base: '/cine-cleaner/',
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: true,
  },
});
