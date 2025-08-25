import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'dist',
  build: {
    outDir: '../build',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'dist/index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});