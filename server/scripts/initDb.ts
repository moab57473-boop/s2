import { connectToDatabase } from '../db/mongodb';
import { Collection, Db } from 'mongodb';

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    const { db } = await connectToDatabase();

    // Drop existing collections
    const existingCollections = await db.listCollections().toArray();
    for (const collection of existingCollections) {
      await db.collection(collection.name).drop();
      console.log(`Dropped collection: ${collection.name}`);
    }

    // Create parcels collection with schema validation
    await db.createCollection('parcels', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['id', 'parcelId', 'weight', 'value', 'department', 'status', 'requiresInsurance', 'insuranceApproved', 'processingTime', 'errorMessage', 'createdAt', 'updatedAt'],
          properties: {
            id: { bsonType: 'string' },
            parcelId: { bsonType: 'string' },
            weight: { bsonType: 'number' },
            value: { bsonType: 'number' },
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
      validationLevel: 'strict',
      validationAction: 'error'
    });
    console.log('Created parcels collection with schema validation');

    // Create business rules collection
    await db.createCollection('businessRules', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['id', 'name', 'rules', 'isActive', 'createdAt', 'updatedAt'],
          properties: {
            id: { bsonType: 'string' },
            name: { bsonType: 'string' },
            rules: { bsonType: 'object' },
            isActive: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });
    console.log('Created businessRules collection with schema validation');

    // Create departments collection
    await db.createCollection('departments', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['id', 'name', 'description', 'color', 'icon', 'isCustom', 'createdAt'],
          properties: {
            id: { bsonType: 'string' },
            name: { bsonType: 'string' },
            description: { bsonType: ['string', 'null'] },
            color: { bsonType: 'string' },
            icon: { bsonType: 'string' },
            isCustom: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' }
          }
        }
      }
    });
    console.log('Created departments collection with schema validation');

    // Create indices
    await Promise.all([
      db.collection('parcels').createIndex({ id: 1 }, { unique: true }),
      db.collection('parcels').createIndex({ parcelId: 1 }, { unique: true }),
      db.collection('parcels').createIndex({ department: 1 }),
      db.collection('parcels').createIndex({ status: 1 }),
      db.collection('businessRules').createIndex({ id: 1 }, { unique: true }),
      db.collection('businessRules').createIndex({ name: 1 }, { unique: true }),
      db.collection('businessRules').createIndex({ isActive: 1 }),
      db.collection('departments').createIndex({ id: 1 }, { unique: true }),
      db.collection('departments').createIndex({ name: 1 }, { unique: true })
    ]);
    console.log('Created indices');

    // List all collections in our database
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    console.log('\nDatabase initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initializeDatabase();