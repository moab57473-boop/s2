import { type Parcel, type InsertParcel } from "@shared/schema";
import { storage } from "../storage";

export interface DepartmentRules {
  mail: { maxWeight: number };
  regular: { maxWeight: number };
  insurance: { minValue: number; enabled: boolean };
}

export class BusinessRulesEngine {
  private defaultRules: DepartmentRules = {
    mail: { maxWeight: 1.0 },
    regular: { maxWeight: 10.0 },
    insurance: { minValue: 1000.0, enabled: true }
  };

  async getCurrentRules(): Promise<DepartmentRules> {
    const businessRules = await storage.getBusinessRules();
    if (businessRules && businessRules.isActive) {
      return businessRules.rules as DepartmentRules;
    }
    return this.defaultRules;
  }

  async updateRules(newRules: DepartmentRules): Promise<void> {
    const existingRules = await storage.getBusinessRules();
    if (existingRules) {
      await storage.updateBusinessRules(existingRules.id, {
        name: existingRules.name,
        rules: newRules,
        isActive: true
      });
    } else {
      await storage.createBusinessRules({
        name: "default",
        rules: newRules,
        isActive: true
      });
    }
  }

  async determineParcelRouting(parcelData: {
    weight: number;
    value: number;
    parcelId: string;
  }): Promise<{
    department: string;
    requiresInsurance: boolean;
    status: string;
  }> {
    const rules = await this.getCurrentRules();
    const { weight, value } = parcelData;

    let department: string;
    let requiresInsurance = false;
    let status = "pending";

    // Determine department based on weight
    if (weight <= rules.mail.maxWeight) {
      department = "mail";
    } else if (weight <= rules.regular.maxWeight) {
      department = "regular";
    } else {
      department = "heavy";
    }

    // Check if insurance review is required
    if (rules.insurance.enabled && value > rules.insurance.minValue) {
      requiresInsurance = true;
      status = "insurance_review";
    }

    return {
      department,
      requiresInsurance,
      status
    };
  }

  async processParcel(parcelData: {
    parcelId: string;
    weight: number;
    value: number;
  }): Promise<Parcel> {
    try {
      const routing = await this.determineParcelRouting(parcelData);
      
      const insertParcel: InsertParcel = {
        parcelId: parcelData.parcelId,
        weight: parcelData.weight.toString(),
        value: parcelData.value.toString(),
        department: routing.department,
        status: routing.status,
        requiresInsurance: routing.requiresInsurance,
        insuranceApproved: false,
        processingTime: new Date()
      };

      return await storage.createParcel(insertParcel);
    } catch (error) {
      // Create parcel with error status
      const insertParcel: InsertParcel = {
        parcelId: parcelData.parcelId,
        weight: parcelData.weight.toString(),
        value: parcelData.value.toString(),
        department: "unassigned",
        status: "error",
        requiresInsurance: false,
        insuranceApproved: false,
        processingTime: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };

      return await storage.createParcel(insertParcel);
    }
  }

  async approveInsurance(parcelId: string): Promise<Parcel | undefined> {
    const parcel = await storage.getParcelByParcelId(parcelId);
    if (!parcel) return undefined;

    if (parcel.requiresInsurance) {
      return await storage.updateParcel(parcel.id, {
        insuranceApproved: true,
        status: "processing"
      });
    }

    return parcel;
  }

  async completeProcessing(parcelId: string): Promise<Parcel | undefined> {
    const parcel = await storage.getParcelByParcelId(parcelId);
    if (!parcel) return undefined;

    return await storage.updateParcel(parcel.id, {
      status: "completed"
    });
  }
}

export const businessRulesEngine = new BusinessRulesEngine();
