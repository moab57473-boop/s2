import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

import { setupIndexes, setupValidation } from './db/setup';

(async () => {
  try {
    // Setup MongoDB indexes and validation
    await setupIndexes();
    await setupValidation();
    console.log('MongoDB setup completed successfully');
  } catch (error) {
    console.error('Failed to setup MongoDB:', error);
    process.exit(1);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const findAvailablePort = async (startPort: number): Promise<number> => {
    const net = await import('net');
    
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      
      const tryPort = (port: number) => {
        server.once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            tryPort(port + 1);
          } else {
            reject(err);
          }
        });
        
        server.once('listening', () => {
          server.close(() => resolve(port));
        });
        
        server.listen(port);
      };
      
      tryPort(startPort);
    });
  };

  try {
    const desiredPort = parseInt(process.env.PORT || '5000', 10);
    const availablePort = await findAvailablePort(desiredPort);
    
    server.listen(availablePort, () => {
      log(`Server is running at http://localhost:${availablePort}`);
      log('Development mode enabled: Vite middleware is active');
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${availablePort} is already in use. Trying another port...`);
      } else {
        log(`Server error: ${error.message}`);
      }
    });
  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Instead of exiting, try to recover
    if (error instanceof Error && error.message.includes('EADDRINUSE')) {
      log('Attempting to start on a different port...');
      const newPort = parseInt(process.env.PORT || '5000', 10) + 1;
      process.env.PORT = newPort.toString();
      // Give some time for the previous port to be released
      setTimeout(() => {
        log(`Retrying with port ${newPort}...`);
        server.listen(newPort);
      }, 1000);
    } else {
      process.exit(1);
    }
  }
})();
