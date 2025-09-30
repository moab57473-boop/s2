// server/storage.js
import { MongoStorage } from './storage/MongoStorage.js';
import { getDb } from './db/mongodb.js';

const db = getDb();
export const storage = new MongoStorage(db);