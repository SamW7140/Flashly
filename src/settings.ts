/**
 * Settings configuration for Flashly plugin
 */

import { FlashcardParserSettings } from './parser/flashcard-parser';

export interface FlashlySettings {
	parser: FlashcardParserSettings;
}

export const DEFAULT_SETTINGS: FlashlySettings = {
	parser: {
		inline: {
			enabled: true,
			enableQA: true,
			enableMultiLine: true,
			enableCloze: true,
			createEmptyCards: true
		},
		header: {
			enabled: true,
			flashcardTags: ['flashcards', 'cards'],
			headerLevels: [2, 3, 4, 5, 6],
			deckNamePriority: ['frontmatter', 'title', 'subtags'],
			useSubtags: true,
			answerTerminator: 'next-header',
			createEmptyCards: true,
			enableExclusion: true,
			exclusionComment: '%%NO_FLASHCARD%%'
		},
		mixedFormats: true
	}
};
