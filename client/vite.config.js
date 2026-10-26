import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, /api requests are proxied to the Express server, so no CORS or hardcoded URLs are needed.
// VITE_BASE is set by the GitHub Pages workflow (e.g. "/uidrop/"); it defaults to "/" everywhere else.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } },
  },
});
