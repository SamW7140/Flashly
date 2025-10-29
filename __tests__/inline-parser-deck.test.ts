/**
 * Tests for InlineParser Deck Name Extraction
 * Tests that inline cards get deck names from source file paths
 */

import { InlineParser, InlineParserSettings } from '../src/parser/inline-parser';

describe('InlineParser - Deck Name Extraction', () => {
	let parser: InlineParser;
	const defaultSettings: InlineParserSettings = {
		enabled: true,
		enableQA: true,
		enableMultiLine: true,
		enableCloze: true,
		createEmptyCards: true,
	};

	beforeEach(() => {
		parser = new InlineParser(defaultSettings);
	});

	describe('Path Extraction', () => {
		it('should extract deck name from simple path', () => {
			const content = 'What is 2+2::4';
			const cards = parser.parse(content, 'MyNote.md');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('MyNote');
		});

		it('should extract deck name from Unix path with folders', () => {
			const content = 'What is 2+2::4';
			const cards = parser.parse(content, 'folder/subfolder/Math.md');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('Math');
		});

		it('should extract deck name from Windows path', () => {
			const content = 'What is 2+2::4';
			const cards = parser.parse(content, 'folder\\subfolder\\History.md');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('History');
		});

		it('should extract deck name from mixed path separators', () => {
			const content = 'What is 2+2::4';
			const cards = parser.parse(content, 'folder/subfolder\\Science.md');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('Science');
		});

		it('should handle path without extension', () => {
			const content = 'What is 2+2::4';
			const cards = parser.parse(content, 'folder/MyNote');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('MyNote');
		});

		it('should default to "Default" for empty path', () => {
			const content = 'What is 2+2::4';
			const cards = parser.parse(content, '');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('Default');
		});

		it('should handle absolute Windows paths', () => {
			const content = 'Test question::Test answer';
			const cards = parser.parse(content, 'C:\\Users\\User\\Vault\\MyNote.md');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('MyNote');
		});

		it('should handle absolute Unix paths', () => {
			const content = 'Test question::Test answer';
			const cards = parser.parse(content, '/home/user/vault/MyNote.md');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('MyNote');
		});

		it('should handle paths with special characters', () => {
			const content = 'Test question::Test answer';
			const cards = parser.parse(content, 'My Vault/Sub Folder/My-Note_2024.md');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('My-Note_2024');
		});
	});

	describe('Q::A Format Deck Names', () => {
		it('should assign correct deck name to Q::A cards', () => {
			const content = `What is 2+2::4
What is 3+3::6
What is 5+5::10`;
			const cards = parser.parse(content, 'Math.md');

			expect(cards).toHaveLength(3);
			expect(cards.every((card: { deck: string }) => card.deck === 'Math')).toBe(true);
		});

		it('should assign different deck names based on source path', () => {
			const mathCards = parser.parse('What is 2+2::4', 'Math.md');
			const scienceCards = parser.parse('What is photosynthesis::Process by which plants make food', 'Science.md');
			const historyCards = parser.parse('Who was Napoleon::French emperor', 'History.md');

			expect(mathCards[0].deck).toBe('Math');
			expect(scienceCards[0].deck).toBe('Science');
			expect(historyCards[0].deck).toBe('History');
		});
	});

	describe('Multi-line (??) Format Deck Names', () => {
		it('should assign correct deck name to ?? cards', () => {
			const content = `Question here?
??
Answer here.`;
			const cards = parser.parse(content, 'Literature.md');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('Literature');
		});

		it('should assign same deck to multiple ?? cards', () => {
			const content = `First question?
??
First answer.

Second question?
??
Second answer.`;
			const cards = parser.parse(content, 'Geography.md');

			expect(cards).toHaveLength(2);
			expect(cards.every((card: { deck: string }) => card.deck === 'Geography')).toBe(true);
		});
	});

	describe('Cloze Format Deck Names', () => {
		it('should assign correct deck name to cloze cards', () => {
			const content = 'The capital of France is {Paris}.';
			const cards = parser.parse(content, 'WorldCapitals.md');

			expect(cards).toHaveLength(1);
			expect(cards[0].deck).toBe('WorldCapitals');
		});

		it('should assign same deck to multiple cloze deletions', () => {
			const content = '{Albert Einstein} developed the theory of {relativity}.';
			const cards = parser.parse(content, 'Physics.md');

			expect(cards).toHaveLength(2);
			expect(cards.every((card: { deck: string }) => card.deck === 'Physics')).toBe(true);
		});
	});

	describe('Mixed Formats Deck Names', () => {
		it('should assign same deck to mixed format types', () => {
			const content = `What is Q::A::This is Q::A format

Multi-line question?
??
Multi-line answer.

The {cloze} format is also supported.`;
			const cards = parser.parse(content, 'MixedFormats.md');

			expect(cards.length).toBeGreaterThanOrEqual(3);
			expect(cards.every((card: { deck: string }) => card.deck === 'MixedFormats')).toBe(true);
		});
	});
});
