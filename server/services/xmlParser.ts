import * as xml2js from "xml2js";
import { type InsertParcel } from "@shared/schema";

export interface ParsedParcel {
  parcelId: string;
  weight: number;
  value: number;
  recipient?: string;
  destination?: string;
  department?: string;
  status?: string;
  requiresInsurance?: boolean;
  insuranceApproved?: boolean;
  processingTime?: Date;
  errorMessage?: string | null;
}

export class XMLParser {
  private parser: xml2js.Parser;

  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,   // Don't put single values in arrays
      ignoreAttrs: false,    // Keep attributes
      mergeAttrs: true,      // Merge attributes into elements
      normalize: true,       // Normalize whitespace
      trim: true,           // Trim whitespace
      strict: false,        // Be more lenient in parsing
      tagNameProcessors: [   // Add tag name processors
        (tagName: string) => tagName.toLowerCase() // Convert all tags to lowercase
      ]
    });
  }

  convertToInsertParcel(parsedParcel: ParsedParcel): InsertParcel {
    // Ensure values are non-negative
    const weight = Math.max(0, parsedParcel.weight);
    const value = Math.max(0, parsedParcel.value);
    
    // Parse the numbers with fixed decimal places for consistency
    const weightNum = parseFloat(weight.toFixed(2));
    const valueNum = parseFloat(value.toFixed(2));

    // Calculate appropriate department based on business rules
    let department: 'mail' | 'regular' | 'heavy' | 'insurance';
    if (weight <= 1) {
      department = 'mail';
    } else if (weight <= 10) {
      department = 'regular';
    } else {
      department = 'heavy';
    }

    // Check if insurance department is needed
    if (value >= 1000) {
      department = 'insurance';
    }

    // Set initial insurance status
    const requiresInsurance = value >= 1000;
    const insuranceApproved = false; // Always start as false

    // Handle optional fields with proper type coercion
    return {
      parcelId: parsedParcel.parcelId,
      weight: weightNum,
      value: valueNum,
      status: 'pending', // Always start as pending
      department: department,
      requiresInsurance: requiresInsurance,
      insuranceApproved: insuranceApproved,
      processingTime: new Date(),
      errorMessage: null
    };
  }

  async parseXML(xmlContent: string): Promise<ParsedParcel[]> {
    try {
      const result = await this.parser.parseStringPromise(xmlContent);
      return this.extractParcels(result);
    } catch (error) {
      throw new Error(`XML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractParcels(parsedXML: any): ParsedParcel[] {
    const result: ParsedParcel[] = [];
    
    console.log('Parsed XML structure:', JSON.stringify(parsedXML, null, 2));
    
    if (!parsedXML) {
      throw new Error("XML parsing resulted in null or undefined");
    }
    
    // Find the Container element (case-insensitive)
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

    // Handle parcel elements (case-insensitive)
    let parcelsContainer = null;
    for (const key of Object.keys(container)) {
      if (key.toLowerCase() === 'parcels') {
        parcelsContainer = container[key];
        break;
      }
    }

    const parcelElements: any[] = [];
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

    if (!parcelElements.length) {
      throw new Error("No Parcel elements found in Container");
    }

    console.log('Found', parcelElements.length, 'parcel elements');

    for (const parcelElement of parcelElements) {
      try {
        const parcel = this.parseParcelElement(parcelElement);
        result.push(parcel);
      } catch (error) {
        console.warn('Failed to parse parcel element:', parcelElement);
        console.warn('Error:', error instanceof Error ? error.message : 'Unknown error');
        // Continue processing other parcels even if one fails
      }
    }

    return result;
  }

  private parseParcelElement(element: any): ParsedParcel {
    // Helper function to get a value regardless of case
    const getValue = (obj: any, keys: string[]): any => {
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
    
    // Extract ID
    const parcelId = getValue(element, ['ID', 'ParcelID', 'parcelId']) || 
                    `PCL-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get recipient info
    const recipientObj = getValue(element, ['Recipient', 'Receipient']);
    let recipientName = '';
    if (recipientObj) {
      recipientName = getValue(recipientObj, ['Name', 'n']) || '';
    }

    // Get address info
    const address = recipientObj ? getValue(recipientObj, ['Address']) : null;
    
    // Build destination string
    const destination = address ? 
      `${getValue(address, ['Street'])} ${getValue(address, ['HouseNumber'])}, ${getValue(address, ['PostalCode'])} ${getValue(address, ['City'])}`.trim() :
      getValue(element, ['Destination']) || '';

    // Get weight and value
    const weight = getValue(element, ['Weight']);
    const value = getValue(element, ['Value']);
    
    let parsedWeight = this.parseNumber(weight);
    let parsedValue = this.parseNumber(value);

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      console.warn(`Invalid weight for parcel ${parcelId}: ${parsedWeight}, setting to default 1.0`);
      parsedWeight = 1.0;
    }

    if (isNaN(parsedValue)) {
      console.warn(`Invalid value for parcel ${parcelId}: ${parsedValue}, setting to 0`);
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

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private getFirstValue(value: any): string | undefined {
    if (Array.isArray(value)) {
      return value[0]?.toString();
    }
    return value?.toString();
  }
}

export const xmlParser = new XMLParser();
