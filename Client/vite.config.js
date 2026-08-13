import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('socket.io-client')) return 'socketio';
            if (id.includes('swiper')) return 'swiper';
            return 'vendor';
          }
        }
      }
    }
  }
});