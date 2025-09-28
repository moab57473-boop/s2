import { Collection, Db } from 'mongodb';
import { connectToDatabase } from './mongodb';

export async function setupIndexes() {
  const { db } = await connectToDatabase();

  // Setup indexes for parcels collection
  await setupParcelIndexes(db);
  
  // Setup indexes for departments collection
  await setupDepartmentIndexes(db);
  
  // Setup indexes for business rules collection
  await setupBusinessRulesIndexes(db);
}

async function setupParcelIndexes(db: Db) {
  const parcels = db.collection('parcels');
  
  await Promise.all([
    // Index for faster lookups by parcelId
    parcels.createIndex({ parcelId: 1 }, { unique: true }),
    
    // Index for status-based queries
    parcels.createIndex({ status: 1 }),
    
    // Index for department-based queries
    parcels.createIndex({ department: 1 }),
    
    // Compound index for department and status queries
    parcels.createIndex({ department: 1, status: 1 }),
    
    // Index for sorting by creation date
    parcels.createIndex({ createdAt: -1 })
  ]);
}

async function setupDepartmentIndexes(db: Db) {
  const departments = db.collection('departments');
  
  await Promise.all([
    // Index for faster lookups by name
    departments.createIndex({ name: 1 }, { unique: true })
  ]);
}

async function setupBusinessRulesIndexes(db: Db) {
  const businessRules = db.collection('businessRules');
  
  await Promise.all([
    // Index for finding active rules
    businessRules.createIndex({ isActive: 1 })
  ]);
}

export async function setupValidation() {
  const { db } = await connectToDatabase();

  await Promise.all([
    db.command({
      collMod: 'parcels',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['parcelId', 'weight', 'department', 'status'],
          properties: {
            parcelId: { bsonType: 'string' },
            weight: { bsonType: 'number', minimum: 0 },
            department: { bsonType: 'string' },
            status: { 
              bsonType: 'string',
              enum: ['pending', 'completed', 'error', 'insurance_review']
            }
          }
        }
      },
      validationLevel: 'moderate'
    }),
    
    db.command({
      collMod: 'departments',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'isCustom'],
          properties: {
            name: { bsonType: 'string' },
            description: { bsonType: ['string', 'null'] },
            isCustom: { bsonType: 'bool' }
          }
        }
      }
    })
  ]);
}