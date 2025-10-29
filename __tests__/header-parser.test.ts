/**
 * Tests for HeaderParser
 * Tests tag detection, header extraction, deck naming, and card creation
 */

import { HeaderParser, HeaderParserSettings } from '../src/parser/header-parser';
import { createMockTFile, createMockCachedMetadata, createMockApp } from './setup';

describe('HeaderParser', () => {
  let parser: HeaderParser;
  let settings: HeaderParserSettings;
  let mockApp: any;

  beforeEach(() => {
    settings = {
      enabled: true,
      flashcardTags: ['flashcards'],
      headerLevels: [2, 3, 4, 5, 6],
      deckNamePriority: ['frontmatter', 'title', 'subtags'],
      useSubtags: true,
      answerTerminator: 'next-header',
      createEmptyCards: true,
      enableExclusion: true,
      exclusionComment: 'flashcard:skip',
    };
    
    mockApp = createMockApp();
    parser = new HeaderParser(settings, mockApp);
  });

  describe('Tag detection', () => {
    it('should detect #flashcards tag in frontmatter', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: ['flashcards']
        }
      });
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      expect(parser.hasFlashcardTag(file)).toBe(true);
    });

    it('should detect #flashcards tag inline', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        tags: [
          { tag: '#flashcards', position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 11, offset: 11 } } }
        ]
      });
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      expect(parser.hasFlashcardTag(file)).toBe(true);
    });

    it('should detect #flashcards/biology subtag inline', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        tags: [
          { tag: '#flashcards/biology', position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 19, offset: 19 } } }
        ]
      });
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      expect(parser.hasFlashcardTag(file)).toBe(true);
    });

    it('should detect tags from both frontmatter and inline', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: ['notes']
        },
        tags: [
          { tag: '#flashcards', position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 11, offset: 11 } } }
        ]
      });
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      expect(parser.hasFlashcardTag(file)).toBe(true);
    });

    it('should detect #flashcards/biology subtag', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: ['flashcards/biology']
        }
      });
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      expect(parser.hasFlashcardTag(file)).toBe(true);
    });

    it('should return false for notes without flashcard tag', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: ['personal', 'notes']
        }
      });
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      expect(parser.hasFlashcardTag(file)).toBe(false);
    });

    it('should handle missing frontmatter', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({});
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      expect(parser.hasFlashcardTag(file)).toBe(false);
    });

    it('should handle string tag (not array)', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: 'flashcards'
        }
      });
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      expect(parser.hasFlashcardTag(file)).toBe(true);
    });
  });

  describe('Deck name resolution', () => {
    it('should use frontmatter deck by default', () => {
      const file = createMockTFile('Biology Notes.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          deck: 'Advanced Biology',
          tags: ['flashcards']
        }
      });
      
      const deckName = parser.getDeckName(file, metadata);
      expect(deckName).toBe('Advanced Biology');
    });

    it('should fall back to note title', () => {
      const file = createMockTFile('Chemistry.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: ['flashcards']
        }
      });
      
      const deckName = parser.getDeckName(file, metadata);
      expect(deckName).toBe('Chemistry');
    });

    it('should extract deck from subtags', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: ['flashcards/biology/cells']
        }
      });
      
      settings.deckNamePriority = ['subtags', 'title'];
      parser = new HeaderParser(settings, mockApp);
      
      const deckName = parser.getDeckName(file, metadata);
      expect(deckName).toBe('biology/cells');
    });

    it('should extract deck from inline subtags', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        tags: [
          { tag: '#flashcards/chemistry/organic', position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 28, offset: 28 } } }
        ]
      });
      
      settings.deckNamePriority = ['subtags', 'title'];
      parser = new HeaderParser(settings, mockApp);
      
      const deckName = parser.getDeckName(file, metadata);
      expect(deckName).toBe('chemistry/organic');
    });

    it('should prioritize frontmatter subtags over inline subtags', () => {
      const file = createMockTFile('test.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: ['flashcards/frontmatter-deck']
        },
        tags: [
          { tag: '#flashcards/inline-deck', position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 22, offset: 22 } } }
        ]
      });
      
      settings.deckNamePriority = ['subtags', 'title'];
      parser = new HeaderParser(settings, mockApp);
      
      const deckName = parser.getDeckName(file, metadata);
      expect(deckName).toBe('frontmatter-deck');
    });

    it('should respect priority order', () => {
      const file = createMockTFile('Title.md');
      const metadata = createMockCachedMetadata({
        frontmatter: {
          deck: 'Frontmatter Deck',
          tags: ['flashcards/subtag']
        }
      });
      
      // Priority: title > frontmatter > subtags
      settings.deckNamePriority = ['title', 'frontmatter', 'subtags'];
      parser = new HeaderParser(settings, mockApp);
      
      const deckName = parser.getDeckName(file, metadata);
      expect(deckName).toBe('Title'); // Title wins
    });
  });

  describe('Header extraction', () => {
    it('should extract H2-H6 headers by default', async () => {
      const content = `# H1 Title
## H2 Question
### H3 Question
#### H4 Question
##### H5 Question
###### H6 Question`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      // H1 skipped, H2-H6 included
      expect(cards).toHaveLength(5);
      expect(cards[0].front).toBe('H2 Question');
      expect(cards[4].front).toBe('H6 Question');
    });

    it('should respect headerLevels configuration', async () => {
      settings.headerLevels = [2, 3];
      parser = new HeaderParser(settings, mockApp);
      
      const content = `## H2 Question
### H3 Question
#### H4 Question`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(2);
      expect(cards[0].front).toBe('H2 Question');
      expect(cards[1].front).toBe('H3 Question');
    });

    it('should skip headers in code blocks', async () => {
      const content = `## Real Question
Answer

\`\`\`markdown
## Fake Question in Code
\`\`\`

## Another Real Question
Answer`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(2);
      expect(cards[0].front).toBe('Real Question');
      expect(cards[1].front).toBe('Another Real Question');
    });

    it('should handle headers with special characters', async () => {
      const content = `## What is **bold** text?
## How do you use \`code\` inline?
## What is a [[wikilink]]?`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(3);
      expect(cards[0].front).toBe('What is **bold** text?');
      expect(cards[1].front).toBe('How do you use `code` inline?');
      expect(cards[2].front).toBe('What is a [[wikilink]]?');
    });
  });

  describe('Answer extraction', () => {
    it('should capture single-line answers', async () => {
      const content = `## Question?
Answer here.`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(1);
      expect(cards[0].back).toBe('Answer here.');
    });

    it('should capture multi-paragraph answers', async () => {
      const content = `## Question?
First paragraph.

Second paragraph.

Third paragraph.`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(1);
      expect(cards[0].back).toContain('First paragraph');
      expect(cards[0].back).toContain('Second paragraph');
      expect(cards[0].back).toContain('Third paragraph');
    });

    it('should preserve markdown formatting in answers', async () => {
      const content = `## Question?
- List item 1
- List item 2

**Bold text** and *italic text*

\`code block\``;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(1);
      expect(cards[0].back).toContain('- List item 1');
      expect(cards[0].back).toContain('**Bold text**');
      expect(cards[0].back).toContain('*italic text*');
    });

    it('should stop at next header', async () => {
      const content = `## Question 1?
Answer 1.

## Question 2?
Answer 2.`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(2);
      expect(cards[0].back).toBe('Answer 1.');
      expect(cards[1].back).toBe('Answer 2.');
    });

    it('should handle empty answers when enabled', async () => {
      const content = `## Question without answer?

## Question with answer?
Answer here.`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(2);
      expect(cards[0].needsFilling).toBe(true);
      expect(cards[1].needsFilling).toBe(false);
    });

    it('should skip empty answers when disabled', async () => {
      settings.createEmptyCards = false;
      parser = new HeaderParser(settings, mockApp);
      
      const content = `## Question without answer?

## Question with answer?
Answer here.`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(1);
      expect(cards[0].front).toBe('Question with answer?');
    });
  });

  describe('Exclusion syntax', () => {
    it('should skip headers with exclusion comment', async () => {
      const content = `## Include this?
Answer 1.

<!-- flashcard:skip -->
## Skip this?
Answer 2.

## Include this too?
Answer 3.`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(2);
      expect(cards[0].front).toBe('Include this?');
      expect(cards[1].front).toBe('Include this too?');
    });

    it('should respect custom exclusion comment', async () => {
      settings.exclusionComment = 'no-card';
      parser = new HeaderParser(settings, mockApp);
      
      const content = `## Question 1?
Answer 1.

<!-- no-card -->
## Question 2?
Answer 2.`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: { tags: ['flashcards'] }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(1);
      expect(cards[0].front).toBe('Question 1?');
    });
  });

  describe('Complete note parsing', () => {
    it('should parse biology note example', async () => {
      const content = `---
tags: [flashcards, biology]
deck: Biology 101
---

## What is a cell?
The basic structural and functional unit of all living organisms.

## What is the function of mitochondria?
Mitochondria are the powerhouse of the cell, responsible for 
producing ATP through cellular respiration.

They have a double membrane structure:
- Outer membrane: smooth
- Inner membrane: folded into cristae`;
      
      const file = createMockTFile('biology.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: ['flashcards', 'biology'],
          deck: 'Biology 101'
        }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(2);
      expect(cards[0].front).toBe('What is a cell?');
      expect(cards[0].deck).toBe('Biology 101');
      expect(cards[0].tags).toContain('flashcards');
      expect(cards[0].tags).toContain('biology');
      expect(cards[1].front).toBe('What is the function of mitochondria?');
      expect(cards[1].back).toContain('powerhouse of the cell');
      expect(cards[1].back).toContain('- Outer membrane: smooth');
    });

    it('should skip notes without flashcard tag', async () => {
      const content = `## Question?
Answer.`;
      
      const file = createMockTFile('test.md', content);
      const metadata = createMockCachedMetadata({
        frontmatter: {
          tags: ['personal']
        }
      });
      
      mockApp.vault.read.mockResolvedValue(content);
      mockApp.metadataCache.getFileCache.mockReturnValue(metadata);
      
      const cards = await parser.parse(file);
      
      expect(cards).toHaveLength(0);
    });
  });
});
