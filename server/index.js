import express from 'express';
import { registerRoutes } from './routes.js';
import { setupVite, log, serveStatic } from './vite.js';
import { setupIndexes, setupValidation } from './db/setup.js';
import { createServer } from 'net';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Logging middleware (only method, path, status, duration)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await setupIndexes();
    await setupValidation();
    console.log('MongoDB setup completed successfully');
  } catch (error) {
    console.error('Failed to setup MongoDB:', error);
    process.exit(1);
  }

  const server = await registerRoutes(app);

  app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const findAvailablePort = async (startPort) => {
    return new Promise((resolve, reject) => {
      const testServer = createServer();
      testServer.unref();

      const tryPort = (port) => {
        testServer.once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            tryPort(port + 1);
          } else {
            reject(err);
          }
        });

        testServer.once('listening', () => {
          testServer.close(() => resolve(port));
        });

        testServer.listen(port);
      };

      tryPort(startPort);
    });
  };

  try {
    const desiredPort = parseInt(process.env.PORT || '5000', 10);
    const availablePort = await findAvailablePort(desiredPort);

    server.listen(availablePort, '0.0.0.0', () => {
      log(`Server is running at http://0.0.0.0:${availablePort}`);
      log('Development mode enabled: Vite middleware is active');
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${availablePort} is already in use. Trying another port...`);
      } else {
        log(`Server error: ${error.message}`);
      }
    });
  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof Error && error.message.includes('EADDRINUSE')) {
      log('Attempting to start on a different port...');
      const newPort = parseInt(process.env.PORT || '5000', 10) + 1;
      process.env.PORT = newPort.toString();
      
      setTimeout(() => {
        log(`Retrying with port ${newPort}...`);
        server.listen(newPort, '0.0.0.0');
      }, 1000);
    } else {
      process.exit(1);
    }
  }
})();
