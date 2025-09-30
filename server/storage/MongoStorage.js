// server/storage/MongoStorage.js
export class MongoStorage {
  constructor(db) {
    this.db = db;
    this.parcels = this.db.collection("parcels");
    this.departments = this.db.collection("departments");
    this.businessRules = this.db.collection("business_rules");
  }

  async getParcels({ page = 1, limit = 10, sortBy = 'receptionDate', order = 'desc' }) {
    const sortOrder = order === 'asc' ? 1 : -1;
    return this.parcels
      .find({})
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
  }

  async createParcels(parcels) {
    if (parcels.length === 0) return;
    return this.parcels.insertMany(parcels);
  }

  async getMetrics() {
    const totalParcels = await this.parcels.countDocuments();
    return { totalParcels };
  }
  
  async getDepartments() {
    return this.departments.find({}).toArray();
  }

  async createDepartment(department) {
    const result = await this.departments.insertOne(department);
    return { ...department, _id: result.insertedId };
  }

  async getBusinessRules() {
    return this.businessRules.findOne({});
  }

  async updateBusinessRules(rules) {
    const { _id, ...rulesToUpdate } = rules;
    return this.businessRules.updateOne(
      { _id: _id },
      { $set: rulesToUpdate },
      { upsert: true }
    );
  }
}