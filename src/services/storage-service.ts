/**
 * StorageService - Manages card persistence and CRUD operations
 * Uses Obsidian's Plugin.loadData() and Plugin.saveData() for storage
 */

import { Plugin } from 'obsidian';
import { Card as FSRSCard } from 'ts-fsrs';
import { FlashlyCard } from '../models/card';

interface StorageData {
  cards: Record<string, SerializedCard>;
  lastSync: number;
  reviewStats?: SerializedReviewStatistics;
}

interface SerializedCard {
  id: string;
  front: string;
  back: string;
  deck: string;
  tags: string[];
  needsFilling: boolean;
  source: { file: string; line: number };
  fsrsCard: FSRSCard;
  created: string;
  updated: string;
}

interface Statistics {
  totalCards: number;
  totalDecks: number;
  cardsNeedingFilling: number;
}

interface ReviewStatistics {
  totalSessions: number;
  totalReviews: number;
  totalDueReviewed: number;
  totalNewReviewed: number;
  cardsReviewedToday: number;
  lastReviewDate: string | null;
}

type SerializedReviewStatistics = ReviewStatistics;

const DEFAULT_REVIEW_STATS: ReviewStatistics = {
  totalSessions: 0,
  totalReviews: 0,
  totalDueReviewed: 0,
  totalNewReviewed: 0,
  cardsReviewedToday: 0,
  lastReviewDate: null
};

export class StorageService {
  private cards: Map<string, FlashlyCard> = new Map();
  private plugin: Plugin;
  private reviewStats: ReviewStatistics = { ...DEFAULT_REVIEW_STATS };

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  /**
   * Load cards from plugin data storage
   */
  async load(): Promise<void> {
    const data = await this.plugin.loadData() as StorageData | null;
    
    if (!data || !data.cards) {
      this.cards = new Map();
      this.reviewStats = { ...DEFAULT_REVIEW_STATS };
      return;
    }

    // Deserialize cards
    for (const [id, serialized] of Object.entries(data.cards)) {
      this.cards.set(id, this.deserializeCard(serialized));
    }

    if (data.reviewStats) {
      this.reviewStats = { ...DEFAULT_REVIEW_STATS, ...data.reviewStats };
    } else {
      this.reviewStats = { ...DEFAULT_REVIEW_STATS };
    }
  }

  /**
   * Save cards to plugin data storage
   */
  async save(): Promise<void> {
    // Load existing data to preserve other keys (like quizStorage)
    const existingData = await this.plugin.loadData() || {};

    const storageData: StorageData = {
      cards: {},
      lastSync: Date.now(),
      reviewStats: this.reviewStats
    };

    // Serialize cards
    for (const [id, card] of this.cards.entries()) {
      storageData.cards[id] = this.serializeCard(card);
    }

    // Merge with existing data to preserve other service's data
    const mergedData = {
      ...existingData,
      ...storageData
    };

    await this.plugin.saveData(mergedData);
  }

  /**
   * Add a single card
   */
  addCard(card: FlashlyCard): void {
    this.cards.set(card.id, card);
  }

  /**
   * Add multiple cards
   */
  addCards(cards: FlashlyCard[]): void {
    for (const card of cards) {
      this.cards.set(card.id, card);
    }
  }

  /**
   * Get a card by ID
   */
  getCard(id: string): FlashlyCard | undefined {
    return this.cards.get(id);
  }

  /**
   * Get all cards
   */
  getAllCards(): FlashlyCard[] {
    return Array.from(this.cards.values());
  }

  /**
   * Update a card (partial update)
   */
  updateCard(id: string, updates: Partial<FlashlyCard>): void {
    const card = this.cards.get(id);
    if (!card) {
      return;
    }

    const updated = { ...card, ...updates, updated: new Date() };
    this.cards.set(id, updated);
  }

  /**
   * Delete a card
   */
  deleteCard(id: string): void {
    this.cards.delete(id);
  }

  /**
   * Get cards by deck
   */
  getCardsByDeck(deck: string): FlashlyCard[] {
    return this.getAllCards().filter(card => card.deck === deck);
  }

  /**
   * Get cards by tag
   */
  getCardsByTag(tag: string): FlashlyCard[] {
    return this.getAllCards().filter(card => card.tags.includes(tag));
  }

  /**
   * Get cards by source file
   */
  getCardsByFile(file: string): FlashlyCard[] {
    return this.getAllCards().filter(card => card.source.file === file);
  }

  /**
   * Get cards that need filling (empty back)
   */
  getCardsNeedingFilling(): FlashlyCard[] {
    return this.getAllCards().filter(card => card.needsFilling);
  }

  /**
   * Get total card count
   */
  getCardCount(): number {
    return this.cards.size;
  }

  /**
   * Get all unique deck names
   */
  getDeckNames(): string[] {
    const decks = new Set<string>();
    for (const card of this.cards.values()) {
      decks.add(card.deck);
    }
    return Array.from(decks);
  }

  /**
   * Get storage statistics
   */
  getStatistics(): Statistics {
    return {
      totalCards: this.getCardCount(),
      totalDecks: this.getDeckNames().length,
      cardsNeedingFilling: this.getCardsNeedingFilling().length
    };
  }

  getReviewStatistics(): ReviewStatistics {
    return { ...this.reviewStats };
  }

  recordReviewSession(summary: {
    totalReviewed: number;
    reviewedDue: number;
    reviewedNew: number;
    startedAt: Date | null;
    finishedAt: Date | null;
  }): void {
    const timestamp = summary.finishedAt ?? summary.startedAt ?? new Date();
    const dateString = timestamp.toISOString();

    if (!this.isSameDay(dateString, this.reviewStats.lastReviewDate)) {
      this.reviewStats.cardsReviewedToday = 0;
    }

    this.reviewStats.totalSessions += 1;
    this.reviewStats.totalReviews += summary.totalReviewed;
    this.reviewStats.totalDueReviewed += summary.reviewedDue;
    this.reviewStats.totalNewReviewed += summary.reviewedNew;
    this.reviewStats.cardsReviewedToday += summary.totalReviewed;
    this.reviewStats.lastReviewDate = dateString;
  }

  private isSameDay(first: string | null, second: string | null): boolean {
    if (!first || !second) {
      return false;
    }

    const a = new Date(first);
    const b = new Date(second);

    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }

  /**
   * Serialize a card for storage
   */
  private serializeCard(card: FlashlyCard): SerializedCard {
    return {
      id: card.id,
      front: card.front,
      back: card.back,
      deck: card.deck,
      tags: card.tags,
      needsFilling: card.needsFilling,
      source: card.source,
      fsrsCard: card.fsrsCard,
      created: card.created.toISOString(),
      updated: card.updated.toISOString()
    };
  }

  /**
   * Deserialize a card from storage
   */
  private deserializeCard(serialized: SerializedCard): FlashlyCard {
    // Deserialize FSRS card dates
    const fsrsCard = {
      ...serialized.fsrsCard,
      due: new Date(serialized.fsrsCard.due),
      last_review: serialized.fsrsCard.last_review ? new Date(serialized.fsrsCard.last_review) : undefined
    };

    return {
      id: serialized.id,
      front: serialized.front,
      back: serialized.back,
      deck: serialized.deck,
      tags: serialized.tags,
      needsFilling: serialized.needsFilling,
      source: serialized.source,
      fsrsCard: fsrsCard,
      created: new Date(serialized.created),
      updated: new Date(serialized.updated)
    };
  }
}
