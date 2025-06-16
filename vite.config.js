import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      components: resolve(__dirname, 'src/components'),
      context: resolve(__dirname, 'src/context'),
      hooks: resolve(__dirname, 'src/hooks'),
      utils: resolve(__dirname, 'src/utils'),
      assets: resolve(__dirname, 'src/assets'),
      i18n: resolve(__dirname, 'src/i18n'),
      PromptApp: resolve(__dirname, 'src/PromptApp.jsx'),
      supabaseClient: resolve(__dirname, 'src/supabaseClient.js'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
});