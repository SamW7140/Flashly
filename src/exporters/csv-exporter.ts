/**
 * CSV Exporter - Generates CSV files using papaparse
 */

import * as Papa from 'papaparse';
import { FlashlyCard } from '../models/card';
import { CSVTransformer, QuizletCSVTransformer } from '../services/export-transformers/csv-transformer';
import { ExportOptions, CSVExportOptions } from '../services/export-transformers/base-transformer';

export class CSVExporter {
	/**
	 * Export cards as CSV
	 */
	export(cards: FlashlyCard[], options: ExportOptions): string {
		let csvContent: string;

		if (options.format === 'csv-quizlet') {
			csvContent = this.exportQuizlet(cards, options as CSVExportOptions);
		} else {
			csvContent = this.exportGeneric(cards, options as CSVExportOptions);
		}

		return csvContent;
	}

	/**
	 * Export as generic CSV with all fields
	 */
	private exportGeneric(
		cards: FlashlyCard[],
		options: CSVExportOptions
	): string {
		const transformer = new CSVTransformer();
		const rows = transformer.transform(cards, options);

		// Add UTF-8 BOM for Excel compatibility
		const bom = options.includeBOM ? '\uFEFF' : '';

		const csv = Papa.unparse(rows, {
			delimiter: options.delimiter || ',',
			header: options.includeHeaders !== false,
			newline: '\r\n',
			quotes: true,
			quoteChar: '"',
			escapeChar: '"'
		});

		return bom + csv;
	}

	/**
	 * Export as Quizlet-compatible CSV (2 columns only)
	 */
	private exportQuizlet(
		cards: FlashlyCard[],
		options: CSVExportOptions
	): string {
		const transformer = new QuizletCSVTransformer();
		const rows = transformer.transform(cards, options);

		const bom = options.includeBOM ? '\uFEFF' : '';

		const csv = Papa.unparse(rows, {
			delimiter: ',', // Quizlet requires comma
			header: true,
			columns: ['term', 'definition'],
			newline: '\r\n',
			quotes: true,
			quoteChar: '"',
			escapeChar: '"'
		});

		return bom + csv;
	}
}
