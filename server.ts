import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/router';

// Make sure environment variables from local env files are processed
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests with sensible security limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic CORS/Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Mount entire safe APIs first
  app.use('/api', apiRouter);

  // Serve static assets or mount Vite dev server based on Env
  if (process.env.NODE_ENV !== 'production') {
    console.log("Starting full-stack application in DEVELOPMENT mode with Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting full-stack application in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Liaison AI Backend] Servir établi avec succès sur http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical failure during backend startup phase:", err);
});
