// server/services/businessRules.js


export class BusinessRulesEngine {
  constructor(storage) {
    this.storage = storage;
  }

  async getRules() {
    if (!this.rules) {
      this.rules = await this.storage.getBusinessRules();
    }
    return this.rules;
  }

  async processParcel(parcel) {
    const rules = await this.getRules();
    let department = 'Mailroom';

    if (parcel.weight > rules.weightRules.HEAVY) {
      department = 'Heavy';
    } else if (parcel.weight < rules.weightRules.REGULAR) {
      department = 'Regular';
    }

    if (parcel.value > rules.valueRules.HIGH_VALUE) {
      department = 'Insurance';
    }

    const requiresInsurance = rules.insurance.enabled && parcel.value >= rules.insurance.minValue;

    return {
      ...parcel,
      department,
      requiresInsurance,
    };
  }
}