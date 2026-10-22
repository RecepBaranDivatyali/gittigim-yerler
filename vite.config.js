import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) {
              return 'vendor-leaflet';
            }
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('@turf')) {
              return 'vendor-turf';
            }
          }
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
});
