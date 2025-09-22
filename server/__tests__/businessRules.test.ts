import { BusinessRulesEngine } from "../services/businessRules";
import { MemStorage } from "../storage";

describe("BusinessRulesEngine", () => {
  let engine: BusinessRulesEngine;
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
    engine = new BusinessRulesEngine();
  });

  describe("determineParcelRouting", () => {
    it("should route light parcels to mail department", async () => {
      const result = await engine.determineParcelRouting({
        weight: 0.5,
        value: 50,
        parcelId: "TEST-001"
      });

      expect(result.department).toBe("mail");
      expect(result.requiresInsurance).toBe(false);
      expect(result.status).toBe("pending");
    });

    it("should route medium parcels to regular department", async () => {
      const result = await engine.determineParcelRouting({
        weight: 5.0,
        value: 200,
        parcelId: "TEST-002"
      });

      expect(result.department).toBe("regular");
      expect(result.requiresInsurance).toBe(false);
      expect(result.status).toBe("pending");
    });

    it("should route heavy parcels to heavy department", async () => {
      const result = await engine.determineParcelRouting({
        weight: 15.0,
        value: 500,
        parcelId: "TEST-003"
      });

      expect(result.department).toBe("heavy");
      expect(result.requiresInsurance).toBe(false);
      expect(result.status).toBe("pending");
    });

    it("should require insurance for high-value parcels", async () => {
      const result = await engine.determineParcelRouting({
        weight: 2.0,
        value: 1500,
        parcelId: "TEST-004"
      });

      expect(result.department).toBe("regular");
      expect(result.requiresInsurance).toBe(true);
      expect(result.status).toBe("insurance_review");
    });

    it("should handle edge case at weight boundaries", async () => {
      const mailBoundary = await engine.determineParcelRouting({
        weight: 1.0,
        value: 50,
        parcelId: "TEST-005"
      });

      const regularBoundary = await engine.determineParcelRouting({
        weight: 10.0,
        value: 200,
        parcelId: "TEST-006"
      });

      expect(mailBoundary.department).toBe("mail");
      expect(regularBoundary.department).toBe("regular");
    });

    it("should handle edge case at value boundary", async () => {
      const belowThreshold = await engine.determineParcelRouting({
        weight: 2.0,
        value: 1000,
        parcelId: "TEST-007"
      });

      const aboveThreshold = await engine.determineParcelRouting({
        weight: 2.0,
        value: 1000.01,
        parcelId: "TEST-008"
      });

      expect(belowThreshold.requiresInsurance).toBe(false);
      expect(aboveThreshold.requiresInsurance).toBe(true);
    });
  });

  describe("processParcel", () => {
    it("should create parcel with correct routing", async () => {
      const parcel = await engine.processParcel({
        parcelId: "TEST-PROCESS-001",
        weight: 2.5,
        value: 150
      });

      expect(parcel.parcelId).toBe("TEST-PROCESS-001");
      expect(parcel.department).toBe("regular");
      expect(parcel.status).toBe("pending");
      expect(parcel.requiresInsurance).toBe(false);
    });

    it("should create parcel with insurance requirement", async () => {
      const parcel = await engine.processParcel({
        parcelId: "TEST-PROCESS-002",
        weight: 0.8,
        value: 1200
      });

      expect(parcel.parcelId).toBe("TEST-PROCESS-002");
      expect(parcel.department).toBe("mail");
      expect(parcel.status).toBe("insurance_review");
      expect(parcel.requiresInsurance).toBe(true);
    });
  });

  describe("updateRules", () => {
    it("should update business rules", async () => {
      const newRules = {
        mail: { maxWeight: 2.0 },
        regular: { maxWeight: 15.0 },
        insurance: { minValue: 500.0, enabled: true }
      };

      await engine.updateRules(newRules);
      const currentRules = await engine.getCurrentRules();

      expect(currentRules.mail.maxWeight).toBe(2.0);
      expect(currentRules.regular.maxWeight).toBe(15.0);
      expect(currentRules.insurance.minValue).toBe(500.0);
    });

    it("should apply updated rules to parcel routing", async () => {
      const newRules = {
        mail: { maxWeight: 2.0 },
        regular: { maxWeight: 15.0 },
        insurance: { minValue: 500.0, enabled: true }
      };

      await engine.updateRules(newRules);

      const result = await engine.determineParcelRouting({
        weight: 1.5,
        value: 600,
        parcelId: "TEST-UPDATED-001"
      });

      expect(result.department).toBe("mail"); // Would be regular with default rules
      expect(result.requiresInsurance).toBe(true); // Would be false with default rules
    });
  });
});
