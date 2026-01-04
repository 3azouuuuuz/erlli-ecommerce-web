// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ---------- PROXY ----------
  server: {
    proxy: {
      // 1. Query Bot (already working)
      '/api/query': {
        target: 'http://84.54.23.242:8012',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/query/, ''),
      },
      // 2. Chatwoot REST API (for agent connection)
      '/api/chatwoot': {
        target: 'http://84.54.23.242:9000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/chatwoot/, '/api/v1'),
      },
      // 3. Chatwoot WebSocket (real-time messages)
      '/cable': {
        target: 'ws://84.54.23.242:9000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
    // ---------- CLIENT-SIDE ROUTING FIX ----------
    historyApiFallback: true, // Simple fix - serve index.html for all routes
  },
});