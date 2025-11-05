import { FlashlyCard } from '../models/card';
import { ExportOptions } from '../services/export-transformers/base-transformer';
import { JSONTransformer } from '../services/export-transformers/json-transformer';

export class JSONExporter {
  private transformer: JSONTransformer;

  constructor() {
    this.transformer = new JSONTransformer();
  }

  export(cards: FlashlyCard[], options: ExportOptions): string {
    const jsonData = this.transformer.transform(cards, options);
    
    // Pretty print with 2 spaces indentation
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    return jsonString;
  }

  /**
   * Export as compact JSON (no formatting)
   */
  exportCompact(cards: FlashlyCard[], options: ExportOptions): string {
    const jsonData = this.transformer.transform(cards, options);
    return JSON.stringify(jsonData);
  }
}
