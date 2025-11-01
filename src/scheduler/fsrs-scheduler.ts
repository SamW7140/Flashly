import {
	FSRS,
	FSRSParameters,
	generatorParameters,
	Rating,
	RecordLog
} from 'ts-fsrs';
import { FlashlyCard } from '../models/card';
import {
	Clock,
	RATING_LABELS,
	ReviewOutcome,
	SchedulerPreview,
	SchedulerStrategy,
	SupportedRating
} from './scheduler-types';

/**
 * FSRS-backed scheduler implementing the common SchedulerStrategy interface.
 */
export class FSRSScheduler implements SchedulerStrategy {
	private fsrs: FSRS;
	private params: FSRSParameters;
	private clock: Clock;

	constructor(clock: Clock = () => new Date(), params?: Partial<FSRSParameters>) {
		this.clock = clock;
		this.params = generatorParameters({
			enable_fuzz: true,
			enable_short_term: false,
			...params
		});
		this.fsrs = new FSRS(this.params);
	}

	private now(override?: Date): Date {
		return override ?? this.clock();
	}

	private toPreview(recordLog: RecordLog): SchedulerPreview {
		return {
			[Rating.Again]: {
				rating: Rating.Again,
				label: RATING_LABELS[Rating.Again],
				nextReview: recordLog[Rating.Again].card.due,
				intervalDays: recordLog[Rating.Again].card.scheduled_days
			},
			[Rating.Hard]: {
				rating: Rating.Hard,
				label: RATING_LABELS[Rating.Hard],
				nextReview: recordLog[Rating.Hard].card.due,
				intervalDays: recordLog[Rating.Hard].card.scheduled_days
			},
			[Rating.Good]: {
				rating: Rating.Good,
				label: RATING_LABELS[Rating.Good],
				nextReview: recordLog[Rating.Good].card.due,
				intervalDays: recordLog[Rating.Good].card.scheduled_days
			},
			[Rating.Easy]: {
				rating: Rating.Easy,
				label: RATING_LABELS[Rating.Easy],
				nextReview: recordLog[Rating.Easy].card.due,
				intervalDays: recordLog[Rating.Easy].card.scheduled_days
			}
		};
	}

	getPreview(card: FlashlyCard, now?: Date): SchedulerPreview {
		const recordLog = this.fsrs.repeat(card.fsrsCard, this.now(now));
		return this.toPreview(recordLog);
	}

	applyRating(card: FlashlyCard, rating: SupportedRating, now?: Date): ReviewOutcome {
		const current = this.now(now);
		const recordLog = this.fsrs.repeat(card.fsrsCard, current);
		const outcome = recordLog[rating];

		const updatedCard: FlashlyCard = {
			...card,
			fsrsCard: outcome.card,
			updated: current
		};

		return {
			updatedCard,
			rating,
			nextReview: outcome.card.due,
			intervalDays: outcome.card.scheduled_days,
			log: outcome.log
		};
	}

	formatDate(date: Date): string {
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
}

export { Rating };
