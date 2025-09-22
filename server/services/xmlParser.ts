import * as xml2js from "xml2js";
import { type InsertParcel } from "@shared/schema";

export interface ParsedParcel {
  parcelId: string;
  weight: number;
  value: number;
  recipient?: string;
  sender?: string;
  destination?: string;
}

export class XMLParser {
  private parser: xml2js.Parser;

  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true
    });
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
    const parcels: ParsedParcel[] = [];
    
    // Handle different XML structures - adapt based on actual XML format
    const container = parsedXML.Container || parsedXML.container;
    if (!container) {
      throw new Error("Invalid XML format: No container element found");
    }

    const parcelElements = container.Parcel || container.parcel || [];
    const parcelArray = Array.isArray(parcelElements) ? parcelElements : [parcelElements];

    for (const parcelElement of parcelArray) {
      try {
        const parcel = this.parseParcelElement(parcelElement);
        parcels.push(parcel);
      } catch (error) {
        console.warn(`Failed to parse parcel element: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continue processing other parcels even if one fails
      }
    }

    return parcels;
  }

  private parseParcelElement(element: any): ParsedParcel {
    const parcelId = element.ID || element.id || element.ParcelID || element.parcelId;
    const weight = this.parseNumber(element.Weight || element.weight);
    const value = this.parseNumber(element.Value || element.value);

    if (!parcelId) {
      throw new Error("Parcel ID is required");
    }

    if (isNaN(weight) || weight <= 0) {
      throw new Error(`Invalid weight for parcel ${parcelId}: ${weight}`);
    }

    if (isNaN(value) || value < 0) {
      throw new Error(`Invalid value for parcel ${parcelId}: ${value}`);
    }

    return {
      parcelId: String(parcelId),
      weight,
      value,
      recipient: element.Recipient || element.recipient,
      sender: element.Sender || element.sender,
      destination: element.Destination || element.destination
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
}

export const xmlParser = new XMLParser();
