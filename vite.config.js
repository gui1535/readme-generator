import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths so the build works under https://<user>.github.io/<repo>/
  base: './',
  build: {
    // Mermaid's chunks are large but only downloaded when a README has a diagram.
    chunkSizeWarningLimit: 1600,
  },
});
