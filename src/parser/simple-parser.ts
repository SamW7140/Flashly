import { FlashlyCard, createFlashlyCard } from '../models/card';
import { createEmptyCard } from 'ts-fsrs';

/**
 * Simple parser for Phase 0 PoC
 * Supports single-line Q::A format only
 */
export class SimpleParser {
	/**
	 * Parse content for Q::A flashcards
	 * @param content - Note content to parse
	 * @param sourcePath - Path to source file
	 * @returns Array of parsed FlashlyCards
	 */
	parse(content: string, sourcePath: string): FlashlyCard[] {
		const cards: FlashlyCard[] = [];
		const lines = content.split('\n');
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			
			// Skip empty lines
			if (!line) continue;
			
			// Parse Q::A format
			const card = this.parseSingleLine(line, sourcePath, i + 1);
			if (card) {
				cards.push(card);
			}
		}
		
		return cards;
	}
	
	/**
	 * Parse single-line Q::A format
	 * Example: "What is 2+2::4"
	 */
	private parseSingleLine(
		line: string,
		sourcePath: string,
		lineNumber: number
	): FlashlyCard | null {
		// Match Q::A pattern
		const match = line.match(/^(.+?)::(.+)$/);
		
		if (!match) {
			return null;
		}
		
		const front = match[1].trim();
		const back = match[2].trim();
		
		// Skip if either side is empty
		if (!front || !back) {
			return null;
		}
		
		// Create new FSRS card
		const fsrsCard = createEmptyCard(new Date());
		
		// Create FlashlyCard
		return createFlashlyCard(
			front,
			back,
			sourcePath,
			lineNumber,
			fsrsCard
		);
	}
}

/**
 * Convenience function to parse content
 */
export function parseSimpleFlashcards(
	content: string,
	sourcePath: string
): FlashlyCard[] {
	const parser = new SimpleParser();
	return parser.parse(content, sourcePath);
}
