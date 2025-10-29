/**
 * Tests for HeaderParser - Inline tag support
 */

import { HeaderParser, HeaderParserSettings } from '../src/parser/header-parser';
import { createMockTFile, createMockCachedMetadata, createMockApp } from './setup';

describe('HeaderParser - Inline Tags', () => {
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

  describe('Inline tag detection', () => {
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
  });

  describe('Inline tag deck naming', () => {
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
  });
});
