import { Card as FSRSCard, State } from 'ts-fsrs';

/**
 * Flashly Card - extends FSRS Card with additional metadata
 */
export interface FlashlyCard {
	id: string;              // Unique identifier
	front: string;           // Question/front of card (Markdown)
	back: string;            // Answer/back of card (Markdown)
	deck: string;            // Deck name (determined by priority: frontmatter > title > subtags)
	tags: string[];          // Associated tags (e.g., ['flashcards', 'biology'])
	needsFilling: boolean;   // True if card has empty back (needs manual completion)
	source: {
		file: string;        // Source file path
		line: number;        // Line number in source file
	};
	fsrsCard: FSRSCard;      // FSRS scheduling data
	created: Date;
	updated: Date;
}

/**
 * Create a new FlashlyCard from parsed content
 */
export function createFlashlyCard(
	front: string,
	back: string,
	sourcePath: string,
	lineNumber: number,
	fsrsCard: FSRSCard,
	deck = 'Default',
	tags: string[] = []
): FlashlyCard {
	const id = `${sourcePath}:L${lineNumber}`;
	const now = new Date();
	const trimmedBack = back.trim();
	
	return {
		id,
		front: front.trim(),
		back: trimmedBack,
		deck,
		tags,
		needsFilling: trimmedBack === '', // Empty back means needs filling
		source: {
			file: sourcePath,
			line: lineNumber
		},
		fsrsCard,
		created: now,
		updated: now
	};
}

/**
 * Card state for display
 */
export enum CardState {
	New = 'New',
	Learning = 'Learning',
	Review = 'Review',
	Relearning = 'Relearning'
}

/**
 * Get human-readable card state
 */
export function getCardStateLabel(state: State): string {
	switch (state) {
		case State.New:
			return CardState.New;
		case State.Learning:
			return CardState.Learning;
		case State.Review:
			return CardState.Review;
		case State.Relearning:
			return CardState.Relearning;
		default:
			return 'Unknown';
	}
}
