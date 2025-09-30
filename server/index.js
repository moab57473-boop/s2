"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const vite_1 = require("./vite");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
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
            (0, vite_1.log)(logLine);
        }
    });
    next();
});
const setup_1 = require("./db/setup");
(async () => {
    try {
        // Setup MongoDB indexes and validation
        await (0, setup_1.setupIndexes)();
        await (0, setup_1.setupValidation)();
        console.log('MongoDB setup completed successfully');
    }
    catch (error) {
        console.error('Failed to setup MongoDB:', error);
        process.exit(1);
    }
    const server = await (0, routes_1.registerRoutes)(app);
    app.use((err, _req, res, _next) => {
        console.error('Error:', err);
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
    });
    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
        await (0, vite_1.setupVite)(app, server);
    }
    else {
        (0, vite_1.serveStatic)(app);
    }
    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const findAvailablePort = async (startPort) => {
        const net = await Promise.resolve().then(() => __importStar(require('net')));
        return new Promise((resolve, reject) => {
            const server = net.createServer();
            server.unref();
            const tryPort = (port) => {
                server.once('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        tryPort(port + 1);
                    }
                    else {
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
            (0, vite_1.log)(`Server is running at http://localhost:${availablePort}`);
            (0, vite_1.log)('Development mode enabled: Vite middleware is active');
        });
        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                (0, vite_1.log)(`Port ${availablePort} is already in use. Trying another port...`);
            }
            else {
                (0, vite_1.log)(`Server error: ${error.message}`);
            }
        });
    }
    catch (error) {
        (0, vite_1.log)(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Instead of exiting, try to recover
        if (error instanceof Error && error.message.includes('EADDRINUSE')) {
            (0, vite_1.log)('Attempting to start on a different port...');
            const newPort = parseInt(process.env.PORT || '5000', 10) + 1;
            process.env.PORT = newPort.toString();
            // Give some time for the previous port to be released
            setTimeout(() => {
                (0, vite_1.log)(`Retrying with port ${newPort}...`);
                server.listen(newPort);
            }, 1000);
        }
        else {
            process.exit(1);
        }
    }
})();
