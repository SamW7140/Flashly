import { FlashlyCard } from '../models/card';
import { ExportOptions } from '../services/export-transformers/base-transformer';
import { MarkdownTransformer } from '../services/export-transformers/markdown-transformer';

export class MarkdownExporter {
  private transformer: MarkdownTransformer;

  constructor() {
    this.transformer = new MarkdownTransformer();
  }

  export(cards: FlashlyCard[], options: ExportOptions): Map<string, string> {
    const result = this.transformer.transform(cards, options);
    return result.decks;
  }

  /**
   * Export all cards to a single markdown file
   */
  exportCombined(cards: FlashlyCard[], options: ExportOptions): string {
    return this.transformer.generateCombinedMarkdown(cards, options);
  }
}
