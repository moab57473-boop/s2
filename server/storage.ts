import { type Parcel, type InsertParcel, type BusinessRules, type InsertBusinessRules, type Department, type InsertDepartment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Parcel operations
  getParcel(id: string): Promise<Parcel | undefined>;
  getParcelByParcelId(parcelId: string): Promise<Parcel | undefined>;
  createParcel(parcel: InsertParcel): Promise<Parcel>;
  updateParcel(id: string, updates: Partial<Parcel>): Promise<Parcel | undefined>;
  getAllParcels(): Promise<Parcel[]>;
  getParcelsByDepartment(department: string): Promise<Parcel[]>;
  getParcelsByStatus(status: string): Promise<Parcel[]>;
  
  // Business rules operations
  getBusinessRules(): Promise<BusinessRules | undefined>;
  createBusinessRules(rules: InsertBusinessRules): Promise<BusinessRules>;
  updateBusinessRules(id: string, rules: InsertBusinessRules): Promise<BusinessRules | undefined>;
  
  // Department operations
  getDepartment(id: string): Promise<Department | undefined>;
  getDepartmentByName(name: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  getAllDepartments(): Promise<Department[]>;
  deleteDepartment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private parcels: Map<string, Parcel>;
  private businessRules: Map<string, BusinessRules>;
  private departments: Map<string, Department>;

  constructor() {
    this.parcels = new Map();
    this.businessRules = new Map();
    this.departments = new Map();
    
    // Initialize default departments
    this.initializeDefaultDepartments();
    this.initializeDefaultBusinessRules();
  }

  private initializeDefaultDepartments() {
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

    defaultDepartments.forEach(dept => {
      const id = randomUUID();
      const department: Department = { 
        ...dept,
        description: dept.description ?? null,
        isCustom: dept.isCustom ?? false,
        id,
        createdAt: new Date()
      };
      this.departments.set(id, department);
    });
  }

  private initializeDefaultBusinessRules() {
    const defaultRules: InsertBusinessRules = {
      name: "default",
      rules: {
        mail: { maxWeight: 1.0 },
        regular: { maxWeight: 10.0 },
        insurance: { minValue: 1000.0, enabled: true }
      },
      isActive: true
    };

    const id = randomUUID();
    const rules: BusinessRules = {
      ...defaultRules,
      isActive: defaultRules.isActive ?? true,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.businessRules.set(id, rules);
  }

  async getParcel(id: string): Promise<Parcel | undefined> {
    return this.parcels.get(id);
  }

  async getParcelByParcelId(parcelId: string): Promise<Parcel | undefined> {
    return Array.from(this.parcels.values()).find(
      (parcel) => parcel.parcelId === parcelId,
    );
  }

  async createParcel(insertParcel: InsertParcel): Promise<Parcel> {
    const id = randomUUID();
    const now = new Date();
    const parcel: Parcel = { 
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

  async updateParcel(id: string, updates: Partial<Parcel>): Promise<Parcel | undefined> {
    const existing = this.parcels.get(id);
    if (!existing) return undefined;

    const updated: Parcel = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.parcels.set(id, updated);
    return updated;
  }

  async getAllParcels(): Promise<Parcel[]> {
    return Array.from(this.parcels.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getParcelsByDepartment(department: string): Promise<Parcel[]> {
    return Array.from(this.parcels.values()).filter(
      parcel => parcel.department === department
    );
  }

  async getParcelsByStatus(status: string): Promise<Parcel[]> {
    return Array.from(this.parcels.values()).filter(
      parcel => parcel.status === status
    );
  }

  async getBusinessRules(): Promise<BusinessRules | undefined> {
    return Array.from(this.businessRules.values()).find(rules => rules.isActive);
  }

  async createBusinessRules(insertRules: InsertBusinessRules): Promise<BusinessRules> {
    const id = randomUUID();
    const now = new Date();
    const rules: BusinessRules = {
      ...insertRules,
      isActive: insertRules.isActive ?? true,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.businessRules.set(id, rules);
    return rules;
  }

  async updateBusinessRules(id: string, insertRules: InsertBusinessRules): Promise<BusinessRules | undefined> {
    const existing = this.businessRules.get(id);
    if (!existing) return undefined;

    const updated: BusinessRules = {
      ...existing,
      ...insertRules,
      updatedAt: new Date()
    };
    this.businessRules.set(id, updated);
    return updated;
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async getDepartmentByName(name: string): Promise<Department | undefined> {
    return Array.from(this.departments.values()).find(
      dept => dept.name === name
    );
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const department: Department = {
      ...insertDepartment,
      description: insertDepartment.description ?? null,
      isCustom: insertDepartment.isCustom ?? false,
      id,
      createdAt: new Date()
    };
    this.departments.set(id, department);
    return department;
  }

  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.departments.delete(id);
  }
}

export const storage = new MemStorage();
