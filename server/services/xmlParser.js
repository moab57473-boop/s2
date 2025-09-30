import xml2js from 'xml2js';

class XMLParser {
  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
      normalize: true,
      trim: true,
      strict: false,
      tagNameProcessors: [
        (tagName) => tagName.toLowerCase()
      ]
    });
  }

  convertToInsertParcel(parsedParcel) {
    const weight = Math.max(0, parsedParcel.weight);
    const value = Math.max(0, parsedParcel.value);

    const weightNum = parseFloat(weight.toFixed(2));
    const valueNum = parseFloat(value.toFixed(2));

    let department;
    if (weight <= 1) {
      department = 'mail';
    } else if (weight <= 10) {
      department = 'regular';
    } else {
      department = 'heavy';
    }

    if (value >= 1000) {
      department = 'insurance';
    }

    return {
      parcelId: parsedParcel.parcelId,
      weight: weightNum,
      value: valueNum,
      status: 'pending',
      department,
      requiresInsurance: value >= 1000,
      insuranceApproved: false,
      processingTime: new Date(),
      errorMessage: null
    };
  }

  async parseXML(xmlContent) {
    try {
      const result = await this.parser.parseStringPromise(xmlContent);
      return this.extractParcels(result);
    } catch (error) {
      throw new Error(`XML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  extractParcels(parsedXML) {
    const result = [];

    if (!parsedXML) {
      throw new Error("XML parsing resulted in null or undefined");
    }

    let container = null;
    const containerKeys = Object.keys(parsedXML);
    for (const key of containerKeys) {
      if (key.toLowerCase() === 'container') {
        container = parsedXML[key];
        break;
      }
    }

    if (!container) {
      throw new Error("Invalid XML format: No Container element found. Available root elements: " +
        containerKeys.join(', '));
    }

    let parcelsContainer = null;
    for (const key of Object.keys(container)) {
      if (key.toLowerCase() === 'parcels') {
        parcelsContainer = container[key];
        break;
      }
    }

    const parcelElements = [];
    if (parcelsContainer) {
      for (const key of Object.keys(parcelsContainer)) {
        if (key.toLowerCase() === 'parcel') {
          const parcelData = parcelsContainer[key];
          if (Array.isArray(parcelData)) {
            parcelElements.push(...parcelData);
          } else if (parcelData) {
            parcelElements.push(parcelData);
          }
        }
      }
    }

    if (!parcelElements || parcelElements.length === 0) {
      throw new Error("No Parcel elements found in Container");
    }

    for (const parcelElement of parcelElements) {
      try {
        const parcel = this.parseParcelElement(parcelElement);
        result.push(parcel);
      } catch (error) {
        console.warn('Failed to parse parcel element:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    return result;
  }

  parseParcelElement(element) {
    const getValue = (obj, keys) => {
      if (!obj) return undefined;
      for (const key of keys) {
        for (const propKey of Object.keys(obj)) {
          if (propKey.toLowerCase() === key.toLowerCase()) {
            const value = obj[propKey];
            if (value !== undefined) return value;
          }
        }
      }
      return undefined;
    };

    const parcelId = getValue(element, ['ID', 'ParcelID', 'parcelId']) ||
      `PCL-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;

    const recipientObj = getValue(element, ['Recipient', 'Receipient']);
    const recipientName = recipientObj ? (getValue(recipientObj, ['Name', 'n']) || '') : '';

    const address = recipientObj ? getValue(recipientObj, ['Address']) : null;
    const destination = address
      ? `${getValue(address, ['Street'])} ${getValue(address, ['HouseNumber'])}, ${getValue(address, ['PostalCode'])} ${getValue(address, ['City'])}`.trim()
      : getValue(element, ['Destination']) || '';

    const weight = getValue(element, ['Weight']);
    const value = getValue(element, ['Value']);

    let parsedWeight = this.parseNumber(weight);
    let parsedValue = this.parseNumber(value);

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      parsedWeight = 1.0;
    }
    if (isNaN(parsedValue)) {
      parsedValue = 0;
    }

    return {
      parcelId: String(parcelId),
      weight: parsedWeight,
      value: parsedValue,
      recipient: recipientName,
      destination
    };
  }

  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  getFirstValue(value) {
    if (Array.isArray(value)) {
      return value[0]?.toString();
    }
    return value?.toString();
  }
}

export const xmlParser = new XMLParser();
export { XMLParser };
