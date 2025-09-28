import { type Parcel, type InsertParcel, type BusinessRules, type InsertBusinessRules, type Department, type InsertDepartment } from "@shared/schema";
import { getCollection } from '../db/mongodb';
import { randomUUID } from "crypto";
import { Document, WithId } from 'mongodb';
import { IStorage } from '../storage';
import type { ParcelDocument, BusinessRulesDocument, DepartmentDocument } from '@shared/schema';

export class MongoStorage implements IStorage {
  async getParcel(id: string): Promise<Parcel | undefined> {
    const collection = await getCollection<ParcelDocument>('parcels');
    const parcel = await collection.findOne({ id });
    return parcel ? { ...parcel } : undefined;
  }

  async getParcelByParcelId(parcelId: string): Promise<Parcel | undefined> {
    const collection = await getCollection<ParcelDocument>('parcels');
    const parcel = await collection.findOne({ parcelId });
    return parcel ? { ...parcel } : undefined;
  }

  async createParcel(insertParcel: InsertParcel): Promise<Parcel> {
    const collection = await getCollection<ParcelDocument>('parcels');
    const now = new Date();
    
    // Validate all required fields are present and have correct types
    const parcel: ParcelDocument = {
      id: randomUUID(),
      parcelId: insertParcel.parcelId,
      weight: Number(insertParcel.weight),
      value: Number(insertParcel.value),
      // Ensure valid department
      department: ['mail', 'regular', 'heavy', 'insurance'].includes(insertParcel.department)
        ? insertParcel.department
        : 'mail',
      // Ensure valid status
      status: ['pending', 'processing', 'completed', 'insurance_review', 'error'].includes(insertParcel.status)
        ? insertParcel.status
        : 'pending',
      requiresInsurance: Boolean(insertParcel.requiresInsurance),
      insuranceApproved: Boolean(insertParcel.insuranceApproved),
      processingTime: insertParcel.processingTime instanceof Date ? insertParcel.processingTime : now,
      errorMessage: insertParcel.errorMessage || null,
      createdAt: now,
      updatedAt: now
    };

    try {
      await collection.insertOne(parcel);
      return parcel;
    } catch (error) {
      console.error('Failed to insert parcel:', error);
      if (error instanceof Error) {
        throw new Error(`MongoDB validation error: ${error.message}`);
      }
      throw error;
    }
  }

  async updateParcel(id: string, updates: Partial<Parcel>): Promise<Parcel | undefined> {
    const collection = await getCollection<Parcel>('parcels');
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async getAllParcels(): Promise<Parcel[]> {
    const collection = await getCollection<Parcel>('parcels');
    return collection.find().sort({ createdAt: -1 }).toArray();
  }

  async getParcelsByDepartment(department: string): Promise<Parcel[]> {
    const collection = await getCollection<Parcel>('parcels');
    return collection.find({ department }).toArray();
  }

  async getParcelsByStatus(status: string): Promise<Parcel[]> {
    const collection = await getCollection<Parcel>('parcels');
    return collection.find({ status }).toArray();
  }

  async getBusinessRules(): Promise<BusinessRules | undefined> {
    const collection = await getCollection<BusinessRulesDocument>('businessRules');
    const rules = await collection.findOne({ isActive: true });
    return rules ? { ...rules } : undefined;
  }

  async createBusinessRules(insertRules: InsertBusinessRules): Promise<BusinessRules> {
    const collection = await getCollection<BusinessRulesDocument>('businessRules');
    const now = new Date();
    const rules: BusinessRulesDocument = {
      ...insertRules,
      isActive: insertRules.isActive ?? true,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      rules: insertRules.rules
    };
    await collection.insertOne(rules);
    return rules;
  }

  async updateBusinessRules(id: string, insertRules: InsertBusinessRules): Promise<BusinessRules | undefined> {
    const collection = await getCollection<BusinessRules>('businessRules');
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ...insertRules, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const collection = await getCollection<DepartmentDocument>('departments');
    const department = await collection.findOne({ id });
    return department ? { ...department } : undefined;
  }

  async getDepartmentByName(name: string): Promise<Department | undefined> {
    const collection = await getCollection<DepartmentDocument>('departments');
    const department = await collection.findOne({ name });
    return department ? { ...department } : undefined;
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const collection = await getCollection<DepartmentDocument>('departments');
    const department: DepartmentDocument = {
      ...insertDepartment,
      description: insertDepartment.description ?? null,
      isCustom: insertDepartment.isCustom ?? false,
      id: randomUUID(),
      createdAt: new Date()
    };
    await collection.insertOne(department);
    return department;
  }

  async getAllDepartments(): Promise<Department[]> {
    const collection = await getCollection<DepartmentDocument>('departments');
    const departments = await collection.find().toArray();
    return departments.map(d => ({ ...d }));
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const collection = await getCollection<DepartmentDocument>('departments');
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async clearAllParcels(): Promise<void> {
    const collection = await getCollection<ParcelDocument>('parcels');
    await collection.deleteMany({});
  }

  async resetToDefaults(): Promise<void> {
    const [parcelsCollection, businessRulesCollection, departmentsCollection] = await Promise.all([
      getCollection<ParcelDocument>('parcels'),
      getCollection<BusinessRulesDocument>('businessRules'),
      getCollection<DepartmentDocument>('departments')
    ]);

    // Clear all collections
      await Promise.all([
        parcelsCollection.deleteMany({}),
        businessRulesCollection.deleteMany({}),
        departmentsCollection.deleteMany({})
      ]);
      
      await Promise.all([
        parcelsCollection.createIndex({ id: 1 }, { unique: true }),
        parcelsCollection.createIndex({ parcelId: 1 }, { unique: true }),
        businessRulesCollection.createIndex({ id: 1 }, { unique: true }),
        businessRulesCollection.createIndex({ name: 1 }, { unique: true }),
        departmentsCollection.createIndex({ id: 1 }, { unique: true }),
        departmentsCollection.createIndex({ name: 1 }, { unique: true })
      ]);    // Initialize default departments
    const defaultDepartments: InsertDepartment[] = [
      {
        name: "mail",
        description: "Packages weighing up to 1kg",
        color: "cyan",
        icon: "envelope",
        isCustom: false
      },
      {
        name: "regular", 
        description: "Packages weighing 1-10kg",
        color: "blue",
        icon: "box",
        isCustom: false
      },
      {
        name: "heavy",
        description: "Packages weighing over 10kg", 
        color: "orange",
        icon: "weight-hanging",
        isCustom: false
      },
      {
        name: "insurance",
        description: "High-value packages requiring approval",
        color: "purple", 
        icon: "shield-alt",
        isCustom: false
      }
    ];

    const defaultRules: InsertBusinessRules = {
      name: "default",
      rules: {
        mail: { maxWeight: 1.0 },
        regular: { maxWeight: 10.0 },
        insurance: { minValue: 1000.0, enabled: true }
      },
      isActive: true
    };

    // Insert defaults
    await Promise.all([
      ...defaultDepartments.map(dept => this.createDepartment(dept)),
      this.createBusinessRules(defaultRules)
    ]);
  }
}