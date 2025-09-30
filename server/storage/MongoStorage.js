import { getCollection } from "../db/mongodb.js";
import { randomUUID } from "crypto";

export class MongoStorage {
  async getParcel(id) {
    const collection = await getCollection("parcels");
    const parcel = await collection.findOne({ id });
    return parcel ? { ...parcel } : undefined;
  }

  async getParcelByParcelId(parcelId) {
    const collection = await getCollection("parcels");
    const parcel = await collection.findOne({ parcelId });
    return parcel ? { ...parcel } : undefined;
  }

  async createParcel(insertParcel) {
    const collection = await getCollection("parcels");
    const now = new Date();
    const parcel = {
      id: randomUUID(),
      parcelId: insertParcel.parcelId,
      weight: Number(insertParcel.weight),
      value: Number(insertParcel.value),
      department: ["mail", "regular", "heavy", "insurance"].includes(insertParcel.department)
        ? insertParcel.department
        : "mail",
      status: ["pending", "processing", "completed", "insurance_review", "error"].includes(
        insertParcel.status
      )
        ? insertParcel.status
        : "pending",
      requiresInsurance: Boolean(insertParcel.requiresInsurance),
      insuranceApproved: Boolean(insertParcel.insuranceApproved),
      processingTime: insertParcel.processingTime instanceof Date ? insertParcel.processingTime : now,
      errorMessage: insertParcel.errorMessage || null,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await collection.insertOne(parcel);
      return parcel;
    } catch (error) {
      console.error("Failed to insert parcel:", error);
      if (error instanceof Error) {
        throw new Error(`MongoDB validation error: ${error.message}`);
      }
      throw error;
    }
  }

  async updateParcel(id, updates) {
    const collection = await getCollection("parcels");
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result || undefined;
  }

  async getAllParcels() {
    const collection = await getCollection("parcels");
    return collection.find().sort({ createdAt: -1 }).toArray();
  }

  async getParcelsByDepartment(department) {
    const collection = await getCollection("parcels");
    return collection.find({ department }).toArray();
  }

  async getParcelsByStatus(status) {
    const collection = await getCollection("parcels");
    return collection.find({ status }).toArray();
  }

  async getBusinessRules() {
    const collection = await getCollection("businessRules");
    const rules = await collection.findOne({ isActive: true });
    return rules ? { ...rules } : undefined;
  }

  async createBusinessRules(insertRules) {
    const collection = await getCollection("businessRules");
    const now = new Date();
    const rules = {
      ...insertRules,
      isActive: insertRules.isActive ?? true,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      rules: insertRules.rules,
    };
    await collection.insertOne(rules);
    return rules;
  }

  async updateBusinessRules(id, insertRules) {
    const collection = await getCollection("businessRules");
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ...insertRules, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result || undefined;
  }

  async getDepartment(id) {
    const collection = await getCollection("departments");
    const department = await collection.findOne({ id });
    return department ? { ...department } : undefined;
  }

  async getDepartmentByName(name) {
    const collection = await getCollection("departments");
    const department = await collection.findOne({ name });
    return department ? { ...department } : undefined;
  }

  async createDepartment(insertDepartment) {
    const collection = await getCollection("departments");
    const department = {
      ...insertDepartment,
      description: insertDepartment.description ?? null,
      isCustom: insertDepartment.isCustom ?? false,
      id: randomUUID(),
      createdAt: new Date(),
    };
    await collection.insertOne(department);
    return department;
  }

  async getAllDepartments() {
    const collection = await getCollection("departments");
    const departments = await collection.find().toArray();
    return departments.map((d) => ({ ...d }));
  }

  async deleteDepartment(id) {
    const collection = await getCollection("departments");
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async clearAllParcels() {
    const collection = await getCollection("parcels");
    await collection.deleteMany({});
  }

  async resetToDefaults() {
    const [parcelsCollection, businessRulesCollection, departmentsCollection] = await Promise.all([
      getCollection("parcels"),
      getCollection("businessRules"),
      getCollection("departments"),
    ]);

    await Promise.all([
      parcelsCollection.deleteMany({}),
      businessRulesCollection.deleteMany({}),
      departmentsCollection.deleteMany({}),
    ]);

    await Promise.all([
      parcelsCollection.createIndex({ id: 1 }, { unique: true }),
      parcelsCollection.createIndex({ parcelId: 1 }, { unique: true }),
      businessRulesCollection.createIndex({ id: 1 }, { unique: true }),
      businessRulesCollection.createIndex({ name: 1 }, { unique: true }),
      departmentsCollection.createIndex({ id: 1 }, { unique: true }),
      departmentsCollection.createIndex({ name: 1 }, { unique: true }),
    ]);

    const defaultDepartments = [
      { name: "mail", description: "Packages weighing up to 1kg", color: "cyan", icon: "envelope", isCustom: false },
      { name: "regular", description: "Packages weighing 1-10kg", color: "blue", icon: "box", isCustom: false },
      { name: "heavy", description: "Packages weighing over 10kg", color: "orange", icon: "weight-hanging", isCustom: false },
      { name: "insurance", description: "High-value packages requiring approval", color: "purple", icon: "shield-alt", isCustom: false },
    ];

    const defaultRules = {
      name: "default",
      rules: {
        mail: { maxWeight: 1.0 },
        regular: { maxWeight: 10.0 },
        insurance: { minValue: 1000.0, enabled: true },
      },
      isActive: true,
    };

    await Promise.all([
      ...defaultDepartments.map((dept) => this.createDepartment(dept)),
      this.createBusinessRules(defaultRules),
    ]);
  }
}
