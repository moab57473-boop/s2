import { connectToDatabase } from '../db/mongodb';
import { CollectionInfo } from 'mongodb';

async function testConnection() {
  try {
    const { db } = await connectToDatabase();
    const collections = await db.listCollections().toArray();
    console.log('Successfully connected to MongoDB!');
    console.log('Available collections:', collections.map((c: CollectionInfo) => c.name));
    
    // Create collections if they don't exist
    if (!collections.find((c: CollectionInfo) => c.name === 'parcels')) {
      await db.createCollection('parcels');
      console.log('Created parcels collection');
    }
    
    if (!collections.find(c => c.name === 'departments')) {
      await db.createCollection('departments');
      console.log('Created departments collection');
    }
    
    if (!collections.find(c => c.name === 'businessRules')) {
      await db.createCollection('businessRules');
      console.log('Created businessRules collection');
    }
    
    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();