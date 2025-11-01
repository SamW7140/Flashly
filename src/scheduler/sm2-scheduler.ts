import { Rating, State } from 'ts-fsrs';
import { FlashlyCard } from '../models/card';
import {
	Clock,
	RATING_LABELS,
	ReviewOutcome,
	SchedulerPreview,
	SchedulerStrategy,
	SupportedRating
} from './scheduler-types';

const DAY_MS = 24 * 60 * 60 * 1000;
const TEN_MINUTES_IN_DAYS = 10 / (60 * 24);

interface ComputedOutcome {
	intervalDays: number;
	due: Date;
	easeFactor: number;
	reps: number;
	lapses: number;
	state: State;
}

/**
 * Lightweight SM-2 inspired scheduler used as a fallback when FSRS is unavailable.
 * Stores its state inside the FSRS card fields so persistence remains consistent.
 */
export class SM2Scheduler implements SchedulerStrategy {
	private clock: Clock;

	constructor(clock: Clock = () => new Date()) {
		this.clock = clock;
	}

	private now(override?: Date): Date {
		return override ?? this.clock();
	}

	private minutesToDays(minutes: number): number {
		return minutes / (60 * 24);
	}

	private compute(card: FlashlyCard, rating: SupportedRating, current: Date): ComputedOutcome {
		const fsrsCard = card.fsrsCard;
		const prevInterval = Math.max(fsrsCard.scheduled_days || 0, 1);
		const prevReps = fsrsCard.reps ?? 0;
		const prevLapses = fsrsCard.lapses ?? 0;
		const easeBase = fsrsCard.difficulty || 2.5;

		let easeFactor = easeBase;
		let intervalDays = prevInterval;
		let reps = prevReps;
		let lapses = prevLapses;
		let state = State.Review;

		switch (rating) {
			case Rating.Again: {
				easeFactor = Math.max(1.3, easeBase - 0.2);
				intervalDays = TEN_MINUTES_IN_DAYS;
				reps = 0;
				lapses = prevLapses + 1;
				state = State.Relearning;
				break;
			}
			case Rating.Hard: {
				easeFactor = Math.max(1.3, easeBase - 0.15);
				intervalDays = Math.max(1, prevInterval * 0.5);
				reps = prevReps + 1;
				state = State.Relearning;
				break;
			}
			case Rating.Good: {
				easeFactor = easeBase;
				if (prevReps === 0) {
					intervalDays = 1;
				} else if (prevReps === 1) {
					intervalDays = 6;
				} else {
					intervalDays = Math.max(1, prevInterval * easeFactor);
				}
				reps = prevReps + 1;
				state = State.Review;
				break;
			}
			case Rating.Easy: {
				easeFactor = easeBase + 0.15;
				if (prevReps === 0) {
					intervalDays = 1;
				} else if (prevReps === 1) {
					intervalDays = 6;
				} else {
					intervalDays = Math.max(1, prevInterval * easeFactor * 1.3);
				}
				reps = prevReps + 1;
				state = State.Review;
				break;
			}
		}

		const due = new Date(current.getTime() + intervalDays * DAY_MS);

		return {
			intervalDays,
			due,
			easeFactor,
			reps,
			lapses,
			state
		};
	}

	getPreview(card: FlashlyCard, now?: Date): SchedulerPreview {
		const current = this.now(now);
		const again = this.compute(card, Rating.Again, current);
		const hard = this.compute(card, Rating.Hard, current);
		const good = this.compute(card, Rating.Good, current);
		const easy = this.compute(card, Rating.Easy, current);

		return {
			[Rating.Again]: {
				rating: Rating.Again,
				label: RATING_LABELS[Rating.Again],
				nextReview: again.due,
				intervalDays: again.intervalDays
			},
			[Rating.Hard]: {
				rating: Rating.Hard,
				label: RATING_LABELS[Rating.Hard],
				nextReview: hard.due,
				intervalDays: hard.intervalDays
			},
			[Rating.Good]: {
				rating: Rating.Good,
				label: RATING_LABELS[Rating.Good],
				nextReview: good.due,
				intervalDays: good.intervalDays
			},
			[Rating.Easy]: {
				rating: Rating.Easy,
				label: RATING_LABELS[Rating.Easy],
				nextReview: easy.due,
				intervalDays: easy.intervalDays
			}
		};
	}

	applyRating(card: FlashlyCard, rating: SupportedRating, now?: Date): ReviewOutcome {
		const current = this.now(now);
		const calculated = this.compute(card, rating, current);
		const fsrsCard = {
			...card.fsrsCard,
			due: calculated.due,
			scheduled_days: calculated.intervalDays,
			last_review: current,
			difficulty: calculated.easeFactor,
			stability: Math.max(calculated.intervalDays, card.fsrsCard.stability ?? calculated.intervalDays),
			reps: calculated.reps,
			lapses: calculated.lapses,
			state: calculated.state
		};

		const updatedCard: FlashlyCard = {
			...card,
			fsrsCard,
			updated: current
		};

		return {
			updatedCard,
			rating,
			nextReview: calculated.due,
			intervalDays: calculated.intervalDays,
			log: {
				scheduler: 'sm2',
				rating,
				intervalDays: calculated.intervalDays
			}
		};
	}
}
