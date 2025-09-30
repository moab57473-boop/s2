import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import runtimeErrorModal from '@replit/vite-plugin-runtime-error-modal';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dynamically import Replit plugins in development
const replitPlugins = process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined
  ? await Promise.all([
      import('@replit/vite-plugin-cartographer').then((m) => m.cartographer()),
      import('@replit/vite-plugin-dev-banner').then((m) => m.devBanner()),
    ])
  : [];

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorModal(),
    ...replitPlugins,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
  root: path.resolve(__dirname, 'client'),
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    fs: {
      strict: true,
      deny: ['**/.*'],
    },
  },
});
