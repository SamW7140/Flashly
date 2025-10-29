/**
 * Tag Requirement Tests
 * Verifies that only files with flashcard tags are parsed
 */

import { FlashcardParser, createDefaultParserSettings } from '../src/parser/flashcard-parser';
import { TFile, App, CachedMetadata, MetadataCache } from 'obsidian';

describe('Tag Requirement for Parsing', () => {
	let mockApp: App;
	let parser: FlashcardParser;

	beforeEach(() => {
		// Create mock app with metadata cache
		mockApp = {
			vault: {
				read: jest.fn(),
			},
			metadataCache: {
				getFileCache: jest.fn(),
			} as unknown as MetadataCache,
		} as unknown as App;

		// Create parser with default settings, adding 'cards' to flashcard tags
		const settings = createDefaultParserSettings();
		settings.header.flashcardTags = ['flashcards', 'cards'];
		parser = new FlashcardParser(settings, mockApp);
	});

	describe('Tagged files - Should be parsed', () => {
		test('should parse file with flashcards tag in frontmatter', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: ['flashcards'] });
			const content = `---
tags: [flashcards]
---

What is test::answer`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards.length).toBeGreaterThan(0);
			expect(cards[0].front).toBe('What is test');
			expect(cards[0].back).toBe('answer');
		});

		test('should parse file with cards tag in frontmatter', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: ['cards'] });
			const content = `---
tags: [cards]
---

What is test::answer`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			// Should parse because 'cards' is in default flashcard tags
			expect(cards.length).toBeGreaterThan(0);
			expect(cards[0].front).toBe('What is test');
			expect(cards[0].back).toBe('answer');
		});

		test('should parse file with flashcards subtag', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: ['flashcards/biology'] });
			const content = `---
tags: [flashcards/biology]
---

What is cell::unit of life`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards.length).toBeGreaterThan(0);
			expect(cards[0].front).toBe('What is cell');
		});

		test('should parse file with multiple tags including flashcards', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: ['notes', 'flashcards', 'study'] });
			const content = `---
tags: [notes, flashcards, study]
---

What is test::answer`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards.length).toBeGreaterThan(0);
		});
	});

	describe('Untagged files - Should NOT be parsed', () => {
		test('should NOT parse file without flashcard tag - inline syntax present', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: [] });
			const content = `---
title: Regular Note
---

What is this::not a flashcard
Random text::another non-flashcard`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards).toHaveLength(0);
		});

		test('should NOT parse file with no frontmatter', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: undefined });
			const content = `# Regular Note

What is this::not a flashcard
Function name::Description`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards).toHaveLength(0);
		});

		test('should NOT parse file with unrelated tags', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: ['notes', 'study', 'project'] });
			const content = `---
tags: [notes, study, project]
---

What is this::not a flashcard`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards).toHaveLength(0);
		});

		test('should NOT parse file with cloze syntax but no tag', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: [] });
			const content = `# Notes

The {variable} is used here.
Another {example} of curly braces.`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards).toHaveLength(0);
		});

		test('should NOT parse file with multi-line syntax but no tag', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: [] });
			const content = `Question here?
??
Answer here.`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards).toHaveLength(0);
		});

		test('should NOT parse file with header structure but no tag', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: [] });
			const content = `## What is this?

Some answer content here.

## Another header

More content.`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards).toHaveLength(0);
		});
	});

	describe('Mixed format parsing in tagged files', () => {
		test('should parse both inline and header formats in same tagged file', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: ['flashcards'] });
			const content = `---
tags: [flashcards]
---

Inline question::inline answer

## Header Question

Header answer here.`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards.length).toBeGreaterThanOrEqual(2);
			
			// Check we got both inline and header cards
			const inlineCard = cards.find(c => c.front === 'Inline question');
			const headerCard = cards.find(c => c.front === 'Header Question');
			
			expect(inlineCard).toBeDefined();
			expect(headerCard).toBeDefined();
		});

		test('should parse all three formats (QA, cloze, headers) in tagged file', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: ['flashcards'] });
			const content = `---
tags: [flashcards]
---

Q::A format card

The {cloze} deletion card.

## Header Card

Answer content.`;

			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards.length).toBeGreaterThanOrEqual(3);
		});
	});

	describe('Edge cases', () => {
		test('should handle file with null metadata', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			
			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(null);
			(mockApp.vault.read as jest.Mock).mockResolvedValue('What is test::answer');

			const cards = await parser.parseFile(mockFile);
			
			expect(cards).toHaveLength(0);
		});

		test('should handle file with no metadata.frontmatter', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = { frontmatter: undefined } as CachedMetadata;
			
			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue('What is test::answer');

			const cards = await parser.parseFile(mockFile);
			
			expect(cards).toHaveLength(0);
		});

		test('should handle file with empty tags array', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: [] });
			
			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue('What is test::answer');

			const cards = await parser.parseFile(mockFile);
			
			expect(cards).toHaveLength(0);
		});

		test('should handle file with single tag as string (not array)', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			// Some files have tags as a string instead of array
			const metadata = { 
				frontmatter: { tags: 'flashcards' }
			} as CachedMetadata;
			const content = `---
tags: flashcards
---

What is test::answer`;
			
			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const cards = await parser.parseFile(mockFile);
			
			expect(cards.length).toBeGreaterThan(0);
		});
	});

	describe('Performance - vault read optimization', () => {
		test('should NOT read file content if file has no tag', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: [] });
			
			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue('content');

			await parser.parseFile(mockFile);
			
			// vault.read should NOT have been called since we skip untagged files
			expect(mockApp.vault.read).not.toHaveBeenCalled();
		});

		test('should read file content for tagged file', async () => {
			const mockFile = createMockFile('test.md', 'folder/test.md');
			const metadata = createMockMetadata({ tags: ['flashcards'] });
			const content = `---
tags: [flashcards]
---

What is test::answer`;
			
			(mockApp.metadataCache.getFileCache as jest.Mock).mockReturnValue(metadata);
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			await parser.parseFile(mockFile);
			
			// vault.read should be called for parsing (both header and inline parsers may read)
			expect(mockApp.vault.read).toHaveBeenCalled();
		});
	});
});

/**
 * Helper: Create mock TFile
 */
function createMockFile(name: string, path: string): TFile {
	return {
		name,
		path,
		basename: name.replace(/\.md$/, ''),
		extension: 'md',
	} as TFile;
}

/**
 * Helper: Create mock metadata with frontmatter
 */
function createMockMetadata(frontmatter: { tags?: string[] | string | undefined }): CachedMetadata {
	return {
		frontmatter: frontmatter.tags === undefined ? undefined : { tags: frontmatter.tags },
	} as CachedMetadata;
}
