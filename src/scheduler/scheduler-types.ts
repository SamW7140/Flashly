import { FlashlyCard } from '../models/card';
import { Rating } from 'ts-fsrs';

/**
 * Human readable label per rating for display.
 */
export type RatingLabel = 'Again' | 'Hard' | 'Good' | 'Easy';

export type SupportedRating = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

/**
 * Preview information for a single rating choice.
 */
export interface RatingPreviewOption {
	rating: SupportedRating;
	label: RatingLabel;
	nextReview: Date;
	/**
	 * Planned interval in days (may include decimals for short intervals).
	 */
	intervalDays: number;
}

/**
 * Complete scheduler preview keyed by rating.
 */
export type SchedulerPreview = Record<SupportedRating, RatingPreviewOption>;

/**
 * Result returned after applying a rating.
 */
export interface ReviewOutcome {
	updatedCard: FlashlyCard;
	rating: SupportedRating;
	nextReview: Date;
	intervalDays: number;
	/**
	 * Optional raw log for downstream analytics.
	 */
	log?: unknown;
}

/**
 * Strategies must implement a preview + apply contract.
 */
export interface SchedulerStrategy {
	getPreview(card: FlashlyCard, now?: Date): SchedulerPreview;
	applyRating(card: FlashlyCard, rating: SupportedRating, now?: Date): ReviewOutcome;
}

export const RATING_LABELS: Record<SupportedRating, RatingLabel> = {
	[Rating.Again]: 'Again',
	[Rating.Hard]: 'Hard',
	[Rating.Good]: 'Good',
	[Rating.Easy]: 'Easy'
};

/**
 * Helper to normalise the time source for deterministic tests.
 */
export type Clock = () => Date;
