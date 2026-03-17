import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative paths in the built index.html
  server: {
    port: 5173,
  },
  assetsInclude: ['**/*.vert', '**/*.frag'],
});