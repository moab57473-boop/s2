import { randomUUID } from 'crypto';
import { MongoStorage } from './storage/MongoStorage.js';

export class MemStorage {
  constructor() {
    this.parcels = new Map();
    this.businessRules = new Map();
    this.departments = new Map();
    
    // Initialize default departments
    this.initializeDefaultDepartments();
    this.initializeDefaultBusinessRules();
  }

  initializeDefaultDepartments() {
    const defaultDepartments = [
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

    defaultDepartments.forEach(dept => {
      const id = randomUUID();
      const department = {
        ...dept,
        description: dept.description ?? null,
        isCustom: dept.isCustom ?? false,
        id,
        createdAt: new Date()
      };
      this.departments.set(id, department);
    });
  }

  initializeDefaultBusinessRules() {
    const defaultRules = {
      name: "default",
      rules: {
        mail: { maxWeight: 1.0 },
        regular: { maxWeight: 10.0 },
        insurance: { minValue: 1000.0, enabled: true }
      },
      isActive: true
    };

    const id = randomUUID();
    const rules = {
      ...defaultRules,
      isActive: defaultRules.isActive ?? true,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.businessRules.set(id, rules);
  }

  async getParcel(id) {
    return this.parcels.get(id);
  }

  async getParcelByParcelId(parcelId) {
    return Array.from(this.parcels.values()).find((parcel) => parcel.parcelId === parcelId);
  }

  async createParcel(insertParcel) {
    const id = randomUUID();
    const now = new Date();
    const parcel = {
      ...insertParcel,
      status: insertParcel.status ?? "pending",
      requiresInsurance: insertParcel.requiresInsurance ?? false,
      insuranceApproved: insertParcel.insuranceApproved ?? false,
      processingTime: insertParcel.processingTime ?? now,
      errorMessage: insertParcel.errorMessage ?? null,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.parcels.set(id, parcel);
    return parcel;
  }

  async updateParcel(id, updates) {
    const existing = this.parcels.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.parcels.set(id, updated);
    return updated;
  }

  async getAllParcels() {
    return Array.from(this.parcels.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getParcelsByDepartment(department) {
    return Array.from(this.parcels.values()).filter(parcel => 
      parcel.department === department
    );
  }

  async getParcelsByStatus(status) {
    return Array.from(this.parcels.values()).filter(parcel => 
      parcel.status === status
    );
  }

  async getBusinessRules() {
    return Array.from(this.businessRules.values()).find(rules => rules.isActive);
  }

  async createBusinessRules(insertRules) {
    const id = randomUUID();
    const now = new Date();
    const rules = {
      ...insertRules,
      isActive: insertRules.isActive ?? true,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.businessRules.set(id, rules);
    return rules;
  }

  async updateBusinessRules(id, insertRules) {
    const existing = this.businessRules.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...insertRules,
      updatedAt: new Date()
    };
    this.businessRules.set(id, updated);
    return updated;
  }

  async getDepartment(id) {
    return this.departments.get(id);
  }

  async getDepartmentByName(name) {
    return Array.from(this.departments.values()).find(dept => dept.name === name);
  }

  async createDepartment(insertDepartment) {
    const id = randomUUID();
    const department = {
      ...insertDepartment,
      description: insertDepartment.description ?? null,
      isCustom: insertDepartment.isCustom ?? false,
      id,
      createdAt: new Date()
    };
    this.departments.set(id, department);
    return department;
  }

  async getAllDepartments() {
    return Array.from(this.departments.values());
  }

  async deleteDepartment(id) {
    return this.departments.delete(id);
  }

  async clearAllParcels() {
    this.parcels.clear();
  }

  async resetToDefaults() {
    // Clear all data
    this.parcels.clear();
    this.businessRules.clear();
    this.departments.clear();
    
    // Reinitialize default data
    this.initializeDefaultDepartments();
    this.initializeDefaultBusinessRules();
  }
}

// Use MongoDB storage instead of in-memory storage
export const storage = new MongoStorage();