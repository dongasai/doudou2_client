import { defineConfig } from 'vite';
import { resolve } from 'path';
import json from '@rollup/plugin-json';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.json']
  },
  plugins: [json()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  json: {
    namedExports: true,
    stringify: false
  }
});