/**
 * Tests for StorageService
 * Tests card persistence, CRUD operations, and serialization
 */

import { StorageService } from '../src/services/storage-service';
import { FlashlyCard } from '../src/models/card';
import { createMockPlugin } from './setup';
import { createEmptyCard } from 'ts-fsrs';

describe('StorageService', () => {
  let service: StorageService;
  let mockPlugin: ReturnType<typeof createMockPlugin>;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    service = new StorageService(mockPlugin);
  });

  describe('Initialization', () => {
    it('should create storage service', () => {
      expect(service).toBeDefined();
    });

    it('should load empty data on first run', async () => {
      mockPlugin.loadData.mockResolvedValue(null);
      await service.load();
      
      const cards = service.getAllCards();
      expect(cards).toEqual([]);
    });

    it('should load existing data', async () => {
      const mockData = {
        cards: {
          'test.md:L1': {
            id: 'test.md:L1',
            front: 'Q',
            back: 'A',
            deck: 'Test',
            tags: [],
            needsFilling: false,
            source: { file: 'test.md', line: 1 },
            fsrsCard: createEmptyCard(new Date()),
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          }
        },
        lastSync: Date.now()
      };
      
      mockPlugin.loadData.mockResolvedValue(mockData);
      await service.load();
      
      const cards = service.getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('test.md:L1');
  });
});

describe('Review statistics', () => {
  let service: StorageService;
  let mockPlugin: ReturnType<typeof createMockPlugin>;

  beforeEach(async () => {
    mockPlugin = createMockPlugin();
    service = new StorageService(mockPlugin);
    mockPlugin.loadData.mockResolvedValue(null);
    await service.load();
  });

  it('should initialise statistics with zeros', () => {
    const stats = service.getReviewStatistics();

    expect(stats.totalSessions).toBe(0);
    expect(stats.cardsReviewedToday).toBe(0);
  });

  it('should record review sessions and reset per day', async () => {
    const firstDay = new Date('2025-01-01T10:00:00Z');
    await service.recordReviewSession({
      totalReviewed: 5,
      reviewedDue: 3,
      reviewedNew: 2,
      startedAt: firstDay,
      finishedAt: firstDay
    });

    const statsAfterFirst = service.getReviewStatistics();
    expect(statsAfterFirst.totalSessions).toBe(1);
    expect(statsAfterFirst.totalReviews).toBe(5);
    expect(statsAfterFirst.cardsReviewedToday).toBe(5);

    const nextDay = new Date('2025-01-02T12:00:00Z');
    await service.recordReviewSession({
      totalReviewed: 4,
      reviewedDue: 1,
      reviewedNew: 3,
      startedAt: nextDay,
      finishedAt: nextDay
    });

    const statsAfterSecond = service.getReviewStatistics();
    expect(statsAfterSecond.totalSessions).toBe(2);
    expect(statsAfterSecond.totalReviews).toBe(9);
    expect(statsAfterSecond.cardsReviewedToday).toBe(4);
  });

  it('should persist statistics through save/load cycle', async () => {
    const reviewDate = new Date('2025-03-10T09:00:00Z');
    await service.recordReviewSession({
      totalReviewed: 6,
      reviewedDue: 4,
      reviewedNew: 2,
      startedAt: reviewDate,
      finishedAt: reviewDate
    });
    await service.save();

    const savedData = mockPlugin.saveData.mock.calls[0][0];
    expect(savedData.reviewStats.totalReviews).toBe(6);

    const reloaded = new StorageService(mockPlugin);
    mockPlugin.loadData.mockResolvedValue(savedData);
    await reloaded.load();

    const statsAfterReload = reloaded.getReviewStatistics();
    expect(statsAfterReload.totalReviews).toBe(6);
    expect(statsAfterReload.totalSessions).toBe(1);
  });
});

  describe('CRUD Operations', () => {
    beforeEach(async () => {
      mockPlugin.loadData.mockResolvedValue(null);
      await service.load();
    });

    it('should add a card', () => {
      const card: FlashlyCard = {
        id: 'test.md:L1',
        front: 'Question',
        back: 'Answer',
        deck: 'Default',
        tags: ['tag1'],
        needsFilling: false,
        source: { file: 'test.md', line: 1 },
        fsrsCard: createEmptyCard(new Date()),
        created: new Date(),
        updated: new Date(),
      };

      service.addCard(card);
      
      const retrieved = service.getCard('test.md:L1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.front).toBe('Question');
    });

    it('should get card by id', () => {
      const card: FlashlyCard = {
        id: 'test.md:L1',
        front: 'Q',
        back: 'A',
        deck: 'Default',
        tags: [],
        needsFilling: false,
        source: { file: 'test.md', line: 1 },
        fsrsCard: createEmptyCard(new Date()),
        created: new Date(),
        updated: new Date(),
      };

      service.addCard(card);
      const retrieved = service.getCard('test.md:L1');
      
      expect(retrieved).toEqual(card);
    });

    it('should return undefined for non-existent card', () => {
      const card = service.getCard('nonexistent');
      expect(card).toBeUndefined();
    });

    it('should get all cards', () => {
      const card1: FlashlyCard = {
        id: 'test1.md:L1',
        front: 'Q1',
        back: 'A1',
        deck: 'Deck1',
        tags: [],
        needsFilling: false,
        source: { file: 'test1.md', line: 1 },
        fsrsCard: createEmptyCard(new Date()),
        created: new Date(),
        updated: new Date(),
      };

      const card2: FlashlyCard = {
        id: 'test2.md:L1',
        front: 'Q2',
        back: 'A2',
        deck: 'Deck2',
        tags: [],
        needsFilling: false,
        source: { file: 'test2.md', line: 1 },
        fsrsCard: createEmptyCard(new Date()),
        created: new Date(),
        updated: new Date(),
      };

      service.addCard(card1);
      service.addCard(card2);
      
      const all = service.getAllCards();
      expect(all).toHaveLength(2);
    });

    it('should update a card', () => {
      const card: FlashlyCard = {
        id: 'test.md:L1',
        front: 'Original',
        back: 'Answer',
        deck: 'Default',
        tags: [],
        needsFilling: false,
        source: { file: 'test.md', line: 1 },
        fsrsCard: createEmptyCard(new Date()),
        created: new Date(),
        updated: new Date(),
      };

      service.addCard(card);
      service.updateCard('test.md:L1', { front: 'Updated' });
      
      const updated = service.getCard('test.md:L1');
      expect(updated?.front).toBe('Updated');
      expect(updated?.back).toBe('Answer'); // Other fields unchanged
    });

    it('should not throw when updating non-existent card', () => {
      expect(() => {
        service.updateCard('nonexistent', { front: 'Test' });
      }).not.toThrow();
    });

    it('should delete a card', () => {
      const card: FlashlyCard = {
        id: 'test.md:L1',
        front: 'Q',
        back: 'A',
        deck: 'Default',
        tags: [],
        needsFilling: false,
        source: { file: 'test.md', line: 1 },
        fsrsCard: createEmptyCard(new Date()),
        created: new Date(),
        updated: new Date(),
      };

      service.addCard(card);
      expect(service.getCard('test.md:L1')).toBeDefined();
      
      service.deleteCard('test.md:L1');
      expect(service.getCard('test.md:L1')).toBeUndefined();
    });

    it('should add multiple cards', () => {
      const cards: FlashlyCard[] = [
        {
          id: 'test1.md:L1',
          front: 'Q1',
          back: 'A1',
          deck: 'Default',
          tags: [],
          needsFilling: false,
          source: { file: 'test1.md', line: 1 },
          fsrsCard: createEmptyCard(new Date()),
          created: new Date(),
          updated: new Date(),
        },
        {
          id: 'test2.md:L1',
          front: 'Q2',
          back: 'A2',
          deck: 'Default',
          tags: [],
          needsFilling: false,
          source: { file: 'test2.md', line: 1 },
          fsrsCard: createEmptyCard(new Date()),
          created: new Date(),
          updated: new Date(),
        }
      ];

      service.addCards(cards);
      expect(service.getAllCards()).toHaveLength(2);
    });
  });

  describe('Filtering', () => {
    beforeEach(async () => {
      mockPlugin.loadData.mockResolvedValue(null);
      await service.load();

      const cards: FlashlyCard[] = [
        {
          id: 'test1.md:L1',
          front: 'Q1',
          back: 'A1',
          deck: 'Math',
          tags: ['algebra'],
          needsFilling: false,
          source: { file: 'test1.md', line: 1 },
          fsrsCard: createEmptyCard(new Date()),
          created: new Date(),
          updated: new Date(),
        },
        {
          id: 'test2.md:L1',
          front: 'Q2',
          back: '',
          deck: 'Science',
          tags: ['biology'],
          needsFilling: true,
          source: { file: 'test2.md', line: 1 },
          fsrsCard: createEmptyCard(new Date()),
          created: new Date(),
          updated: new Date(),
        },
        {
          id: 'test3.md:L1',
          front: 'Q3',
          back: 'A3',
          deck: 'Math',
          tags: ['geometry'],
          needsFilling: false,
          source: { file: 'test3.md', line: 1 },
          fsrsCard: createEmptyCard(new Date()),
          created: new Date(),
          updated: new Date(),
        }
      ];

      service.addCards(cards);
    });

    it('should get cards by deck', () => {
      const mathCards = service.getCardsByDeck('Math');
      expect(mathCards).toHaveLength(2);
      expect(mathCards.every((c: FlashlyCard) => c.deck === 'Math')).toBe(true);
    });

    it('should get cards by tag', () => {
      const algebraCards = service.getCardsByTag('algebra');
      expect(algebraCards).toHaveLength(1);
      expect(algebraCards[0].tags).toContain('algebra');
    });

    it('should get cards by file', () => {
      const fileCards = service.getCardsByFile('test1.md');
      expect(fileCards).toHaveLength(1);
      expect(fileCards[0].source.file).toBe('test1.md');
    });

    it('should get cards needing filling', () => {
      const emptyCards = service.getCardsNeedingFilling();
      expect(emptyCards).toHaveLength(1);
      expect(emptyCards[0].needsFilling).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should save cards to plugin data', async () => {
      mockPlugin.loadData.mockResolvedValue(null);
      await service.load();

      const card: FlashlyCard = {
        id: 'test.md:L1',
        front: 'Q',
        back: 'A',
        deck: 'Default',
        tags: [],
        needsFilling: false,
        source: { file: 'test.md', line: 1 },
        fsrsCard: createEmptyCard(new Date()),
        created: new Date(),
        updated: new Date(),
      };

      service.addCard(card);
      await service.save();

      expect(mockPlugin.saveData).toHaveBeenCalled();
      const savedData = mockPlugin.saveData.mock.calls[0][0];
      expect(savedData.cards).toBeDefined();
      expect(savedData.cards['test.md:L1']).toBeDefined();
    });

    it('should serialize dates correctly', async () => {
      mockPlugin.loadData.mockResolvedValue(null);
      await service.load();

      const now = new Date();
      const card: FlashlyCard = {
        id: 'test.md:L1',
        front: 'Q',
        back: 'A',
        deck: 'Default',
        tags: [],
        needsFilling: false,
        source: { file: 'test.md', line: 1 },
        fsrsCard: createEmptyCard(now),
        created: now,
        updated: now,
      };

      service.addCard(card);
      await service.save();

      const savedData = mockPlugin.saveData.mock.calls[0][0];
      const savedCard = savedData.cards['test.md:L1'];
      
      // Dates should be serialized as ISO strings
      expect(typeof savedCard.created).toBe('string');
      expect(typeof savedCard.updated).toBe('string');
    });

    it('should deserialize dates correctly', async () => {
      const now = new Date();
      const mockData = {
        cards: {
          'test.md:L1': {
            id: 'test.md:L1',
            front: 'Q',
            back: 'A',
            deck: 'Default',
            tags: [],
            needsFilling: false,
            source: { file: 'test.md', line: 1 },
            fsrsCard: createEmptyCard(now),
            created: now.toISOString(),
            updated: now.toISOString(),
          }
        },
        lastSync: Date.now()
      };

      mockPlugin.loadData.mockResolvedValue(mockData);
      await service.load();

      const card = service.getCard('test.md:L1');
      expect(card).toBeDefined();
      expect(card?.created).toBeInstanceOf(Date);
      expect(card?.updated).toBeInstanceOf(Date);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      mockPlugin.loadData.mockResolvedValue(null);
      await service.load();

      const cards: FlashlyCard[] = [
        {
          id: 'test1.md:L1',
          front: 'Q1',
          back: 'A1',
          deck: 'Math',
          tags: ['algebra'],
          needsFilling: false,
          source: { file: 'test1.md', line: 1 },
          fsrsCard: createEmptyCard(new Date()),
          created: new Date(),
          updated: new Date(),
        },
        {
          id: 'test2.md:L1',
          front: 'Q2',
          back: '',
          deck: 'Science',
          tags: [],
          needsFilling: true,
          source: { file: 'test2.md', line: 1 },
          fsrsCard: createEmptyCard(new Date()),
          created: new Date(),
          updated: new Date(),
        },
        {
          id: 'test3.md:L1',
          front: 'Q3',
          back: 'A3',
          deck: 'Math',
          tags: [],
          needsFilling: false,
          source: { file: 'test3.md', line: 1 },
          fsrsCard: createEmptyCard(new Date()),
          created: new Date(),
          updated: new Date(),
        }
      ];

      service.addCards(cards);
    });

    it('should get total card count', () => {
      const count = service.getCardCount();
      expect(count).toBe(3);
    });

    it('should get deck names', () => {
      const decks = service.getDeckNames();
      expect(decks).toContain('Math');
      expect(decks).toContain('Science');
      expect(decks).toHaveLength(2);
    });

    it('should get statistics', () => {
      const stats = service.getStatistics();
      expect(stats.totalCards).toBe(3);
      expect(stats.totalDecks).toBe(2);
      expect(stats.cardsNeedingFilling).toBe(1);
    });
  });
});
