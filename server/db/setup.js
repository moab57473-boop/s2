// server/db/setup.js
import { connectToDatabase } from './mongodb.js';

export async function setupDatabase() {
  const db = await connectToDatabase();
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  if (!collectionNames.includes('departments')) {
    const departmentsCollection = await db.createCollection('departments');
    await departmentsCollection.insertMany([
      { name: 'Mailroom', isCustom: false },
      { name: 'Regular', isCustom: false },
      { name: 'Heavy', isCustom: false },
      { name: 'Insurance', isCustom: false },
    ]);
    console.log("Created and seeded 'departments' collection.");
  }

  if (!collectionNames.includes('business_rules')) {
    const rulesCollection = await db.createCollection('business_rules');
    await rulesCollection.insertOne({
      weightRules: { REGULAR: 1, HEAVY: 10 },
      valueRules: { HIGH_VALUE: 1000 },
      insurance: { enabled: true, minValue: 1000 },
    });
    console.log("Created and seeded 'business_rules' collection.");
  }
  
  if (!collectionNames.includes('parcels')) {
    await db.createCollection('parcels');
    console.log("Created 'parcels' collection.");
  }
}