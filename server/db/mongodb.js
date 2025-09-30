import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = 'parcel_processing';

let client = null;
let db = null;

const options = {
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
  waitQueueTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true
};

let isConnecting = false;
let connectionPromise = null;

export async function connectToDatabase() {
  // If we're already connecting, wait for that connection
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  // If we have an existing client, verify it's still valid
  if (client) {
    try {
      await client.db().command({ ping: 1 });
      return { client, db: client.db(dbName) };
    } catch (error) {
      console.log('Previous connection is not valid, creating new connection...');
      // Clean up the broken connection
      try {
        await client.close(true);
      } catch (closeError) {
        console.error('Error closing broken connection:', closeError);
      }
      client = null;
      db = null;
    }
  }

  // Start a new connection
  isConnecting = true;
  connectionPromise = (async () => {
    try {
      console.log('Attempting to connect to MongoDB...');
      console.log('Connection URI:', uri);
      console.log('Database Name:', dbName);

      // Create new connection
      client = new MongoClient(uri, options);

      // Set up event handlers
      client.on('serverHeartbeatFailed', (event) => {
        console.error('MongoDB heartbeat failed:', event);
      });

      client.on('serverHeartbeatSucceeded', () => {
        console.log('MongoDB heartbeat succeeded');
      });

      client.on('connectionPoolCleared', () => {
        console.warn('MongoDB connection pool cleared');
      });

      await client.connect();
      console.log('Connected to MongoDB');

      // Test the connection and initialize the database
      db = client.db(dbName);
      await db.command({ ping: 1 });
      console.log('MongoDB connection test successful');

      return { client, db };
    } catch (error) {
      console.error('MongoDB connection error:', error);
      // Clean up on failure
      if (client) {
        try {
          await client.close(true);
        } catch (closeError) {
          console.error('Error closing failed connection:', closeError);
        }
      }
      client = null;
      db = null;
      throw new Error('Could not connect to MongoDB. Please make sure MongoDB is running.');
    } finally {
      isConnecting = false;
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

async function setupCollections(db) {
  // Set up parcels collection with schema validation
  await db.createCollection('parcels', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['parcelId', 'weight', 'value', 'department', 'status', 'requiresInsurance', 'insuranceApproved', 'processingTime', 'errorMessage'],
        properties: {
          parcelId: { bsonType: 'string' },
          weight: { bsonType: 'string' },
          value: { bsonType: 'string' },
          department: { bsonType: 'string', enum: ['mail', 'regular', 'heavy', 'insurance'] },
          status: { bsonType: 'string', enum: ['pending', 'processing', 'completed', 'insurance_review', 'error'] },
          requiresInsurance: { bsonType: 'bool' },
          insuranceApproved: { bsonType: 'bool' },
          processingTime: { bsonType: 'date' },
          errorMessage: { bsonType: ['string', 'null'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    validationAction: 'error'
  }).catch(err => {
    if (err.code !== 48) { // Skip if collection already exists
      console.error('Error creating parcels collection:', err);
      throw err;
    }
  });

  // Set up indices
  const collections = {
    parcels: db.collection('parcels'),
    businessRules: db.collection('businessRules'),
    departments: db.collection('departments')
  };

  await Promise.all([
    collections.parcels.createIndex({ parcelId: 1 }, { unique: true }),
    collections.parcels.createIndex({ department: 1 }),
    collections.parcels.createIndex({ status: 1 }),
    collections.businessRules.createIndex({ name: 1 }, { unique: true }),
    collections.businessRules.createIndex({ isActive: 1 }),
    collections.departments.createIndex({ name: 1 }, { unique: true })
  ]).catch(console.error);
}

export async function getCollection(name) {
  const { db } = await connectToDatabase();
  // Initialize collections and indices if needed
  await setupCollections(db);
  return db.collection(name);
}

export async function closeConnection() {
  if (client) {
    try {
      await client.close(true);
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    } finally {
      client = null;
      db = null;
    }
  }
}

// Handle process shutdown
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});