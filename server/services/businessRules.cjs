"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessRulesEngine = exports.BusinessRulesEngine = void 0;
const storage_1 = require("../storage.cjs");
class BusinessRulesEngine {
    constructor() {
        this.defaultRules = {
            mail: { maxWeight: 1.0 },
            regular: { maxWeight: 10.0 },
            insurance: { minValue: 1000.0, enabled: true }
        };
    }
    async getCurrentRules() {
        const businessRules = await storage_1.storage.getBusinessRules();
        if (businessRules && businessRules.isActive) {
            return businessRules.rules;
        }
        return this.defaultRules;
    }
    async updateRules(newRules) {
        const existingRules = await storage_1.storage.getBusinessRules();
        if (existingRules) {
            await storage_1.storage.updateBusinessRules(existingRules.id, {
                name: existingRules.name,
                rules: newRules,
                isActive: true
            });
        }
        else {
            await storage_1.storage.createBusinessRules({
                name: "default",
                rules: newRules,
                isActive: true
            });
        }
    }
    async determineParcelRouting(parcelData) {
        const rules = await this.getCurrentRules();
        const { weight, value } = parcelData;
        let department;
        let requiresInsurance = false;
        let status = "pending";
        // Determine department based on weight
        if (weight <= rules.mail.maxWeight) {
            department = "mail";
        }
        else if (weight <= rules.regular.maxWeight) {
            department = "regular";
        }
        else {
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
    async processParcel(parcelData) {
        try {
            // Convert weight and value to numbers
            const weight = typeof parcelData.weight === 'string' ?
                parseFloat(parcelData.weight) : parcelData.weight;
            const value = typeof parcelData.value === 'string' ?
                parseFloat(parcelData.value) : parcelData.value;
            if (isNaN(weight)) {
                throw new Error(`Invalid weight value for parcel ${parcelData.parcelId}`);
            }
            if (isNaN(value)) {
                throw new Error(`Invalid value amount for parcel ${parcelData.parcelId}`);
            }
            const routing = await this.determineParcelRouting({
                ...parcelData,
                weight,
                value
            });
            const insertParcel = {
                parcelId: parcelData.parcelId,
                weight: weight.toString(),
                value: value.toString(),
                department: routing.department,
                status: routing.status,
                requiresInsurance: routing.requiresInsurance,
                insuranceApproved: false,
                processingTime: new Date(),
                errorMessage: null
            };
            return await storage_1.storage.createParcel(insertParcel);
        }
        catch (error) {
            // Create parcel with error status
            const insertParcel = {
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
            return await storage_1.storage.createParcel(insertParcel);
        }
    }
    async approveInsurance(parcelId) {
        const parcel = await storage_1.storage.getParcelByParcelId(parcelId);
        if (!parcel)
            return undefined;
        if (parcel.requiresInsurance) {
            return await storage_1.storage.updateParcel(parcel.id, {
                insuranceApproved: true,
                status: "processing"
            });
        }
        return parcel;
    }
    async completeProcessing(parcelId) {
        const parcel = await storage_1.storage.getParcelByParcelId(parcelId);
        if (!parcel)
            return undefined;
        return await storage_1.storage.updateParcel(parcel.id, {
            status: "completed"
        });
    }
}
exports.BusinessRulesEngine = BusinessRulesEngine;
exports.businessRulesEngine = new BusinessRulesEngine();
