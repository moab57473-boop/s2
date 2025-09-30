// server/vite.js
import { createServer as createViteServer } from 'vite';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

// Replicate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function configureVite(app) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // In production, serve the static files from the 'dist/client' directory
    const clientDistPath = path.resolve(__dirname, '..', 'dist', 'client');
    app.use(express.static(clientDistPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(clientDistPath, 'index.html'));
    });
  } else {
    // In development, use Vite's dev server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
}