import { 
	FSRS, 
	FSRSParameters, 
	generatorParameters, 
	Rating, 
	RecordLog,
	RecordLogItem
} from 'ts-fsrs';
import { FlashlyCard } from '../models/card';

/**
 * Wrapper around ts-fsrs library for simplified scheduling
 */
export class FSRSScheduler {
	private fsrs: FSRS;
	private params: FSRSParameters;
	
	constructor() {
		// Initialize with default parameters
		// enable_fuzz: adds randomness to prevent card bunching
		// enable_short_term: enables short-term memory optimization
		this.params = generatorParameters({ 
			enable_fuzz: true,
			enable_short_term: false 
		});
		this.fsrs = new FSRS(this.params);
	}
	
	/**
	 * Schedule a new card (first review)
	 * Returns all possible scheduling options (Again, Hard, Good, Easy)
	 */
	scheduleNew(card: FlashlyCard): RecordLog {
		const now = new Date();
		return this.fsrs.repeat(card.fsrsCard, now);
	}
	
	/**
	 * Review a card with a specific rating
	 * @param card - The card being reviewed
	 * @param rating - User's rating (Again=1, Hard=2, Good=3, Easy=4)
	 * @returns Updated card and review log
	 */
	review(card: FlashlyCard, rating: Rating): RecordLogItem {
		const now = new Date();
		const schedulingResults = this.fsrs.repeat(card.fsrsCard, now);
		
		// Get the result for the specific rating
		const results = Object.values(schedulingResults);
		return results[rating - 1]; // Rating.Again=1, so subtract 1 for array index
	}
	
	/**
	 * Get the next review date for a card based on rating
	 */
	getNextReviewDate(card: FlashlyCard, rating: Rating): Date {
		const result = this.review(card, rating);
		return result.card.due;
	}
	
	/**
	 * Format a date for display
	 */
	formatDate(date: Date): string {
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	/**
	 * Get scheduling information for all rating options
	 */
	getSchedulingInfo(card: FlashlyCard): SchedulingInfo {
		const results = this.scheduleNew(card);
		const resultsArray = Object.values(results);
		
		return {
			[Rating.Again]: {
				rating: Rating.Again,
				label: 'Again',
				nextReview: resultsArray[0].card.due,
				interval: resultsArray[0].card.scheduled_days
			},
			[Rating.Hard]: {
				rating: Rating.Hard,
				label: 'Hard',
				nextReview: resultsArray[1].card.due,
				interval: resultsArray[1].card.scheduled_days
			},
			[Rating.Good]: {
				rating: Rating.Good,
				label: 'Good',
				nextReview: resultsArray[2].card.due,
				interval: resultsArray[2].card.scheduled_days
			},
			[Rating.Easy]: {
				rating: Rating.Easy,
				label: 'Easy',
				nextReview: resultsArray[3].card.due,
				interval: resultsArray[3].card.scheduled_days
			}
		};
	}
}

/**
 * Scheduling information for display
 */
export interface SchedulingInfo {
	[Rating.Again]: RatingInfo;
	[Rating.Hard]: RatingInfo;
	[Rating.Good]: RatingInfo;
	[Rating.Easy]: RatingInfo;
}

export interface RatingInfo {
	rating: Rating;
	label: string;
	nextReview: Date;
	interval: number;  // Days until next review
}

// Re-export Rating for convenience
export { Rating };
