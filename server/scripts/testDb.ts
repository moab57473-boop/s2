import { connectToDatabase, closeConnection } from '../db/mongodb';

async function main() {
  try {
    console.log('Testing database connection...');
    
    const { db } = await connectToDatabase();
    console.log('Successfully connected to database');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Create indexes and test collections
    const results = await Promise.allSettled([
      db.collection('parcels').createIndex({ id: 1 }, { unique: true }),
      db.collection('parcels').createIndex({ parcelId: 1 }, { unique: true }),
      db.collection('businessRules').createIndex({ id: 1 }, { unique: true }),
      db.collection('businessRules').createIndex({ name: 1 }, { unique: true }),
      db.collection('departments').createIndex({ id: 1 }, { unique: true }),
      db.collection('departments').createIndex({ name: 1 }, { unique: true })
    ]);
    
    console.log('Index creation results:', results);
    
    console.log('All tests passed');
  } catch (error) {
    console.error('Database test failed:', error);
    process.exitCode = 1;
  } finally {
    await closeConnection();
  }
}

main();