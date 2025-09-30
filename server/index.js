// server/index.js
import express from 'express';
import { connectToDatabase, getDb } from './db/mongodb.js';
import { setupDatabase } from './db/setup.js';
import { registerRoutes } from './routes.js';
import { configureVite } from './vite.js';
import { MongoStorage } from './storage/MongoStorage.js';

const app = express();
const port = process.env.PORT || 3000;

async function startServer() {
  // 1. Connect to database
  const db = await connectToDatabase();
  console.log('Database connection established.');

  // 2. Set up collections
  await setupDatabase();
  console.log('Database setup complete.');

  // 3. Create storage instance *after* db is ready
  const storage = new MongoStorage(db);

  // 4. Configure middleware
  app.use(express.json());

  // 5. Register routes and pass the storage instance
  registerRoutes(app, storage);

  // 6. Configure Vite
  configureVite(app);

  // 7. Start the server
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start the server:', error);
  process.exit(1);
});