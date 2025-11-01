import { FlashlyCard } from '../models/card';
import { SchedulerPreview, SchedulerStrategy, SupportedRating, ReviewOutcome } from '../scheduler/scheduler-types';
import { QueueSnapshot } from '../services/review-queue';
import { StorageService } from '../services/storage-service';

type SessionStatus = 'idle' | 'in-progress' | 'complete';

type SessionCardType = 'due' | 'new';

interface SessionCard {
	card: FlashlyCard;
	type: SessionCardType;
}

interface CompletedCard {
	cardId: string;
	type: SessionCardType;
	rating: SupportedRating;
	outcome: ReviewOutcome;
	completedAt: Date;
}

interface SessionState {
	status: SessionStatus;
	startedAt: Date | null;
	finishedAt: Date | null;
	queue: SessionCard[];
	index: number;
	showingAnswer: boolean;
	completed: CompletedCard[];
	queueSnapshot: QueueSnapshot;
}

export interface ProgressState {
	currentIndex: number;
	totalCards: number;
	completed: number;
	showingAnswer: boolean;
}

export interface SessionSummary {
	totalReviewed: number;
	reviewedDue: number;
	reviewedNew: number;
	startedAt: Date | null;
	finishedAt: Date | null;
}

export interface RateResult {
	outcome: ReviewOutcome;
	remaining: number;
	completed: number;
	nextCard: FlashlyCard | null;
}

export interface ReviewSessionDependencies {
	storage: StorageService;
	scheduler: SchedulerStrategy;
	queueSnapshot: QueueSnapshot;
}

/**
 * Pure ViewModel for managing a review session.
 * Handles queue traversal, rating actions, and progress bookkeeping.
 */
export class ReviewSessionViewModel {
	private state: SessionState;
	private readonly storage: StorageService;
	private readonly scheduler: SchedulerStrategy;

	constructor(deps: ReviewSessionDependencies) {
		this.storage = deps.storage;
		this.scheduler = deps.scheduler;

		const queue: SessionCard[] = [
			...deps.queueSnapshot.due.map(card => ({ card, type: 'due' as const })),
			...deps.queueSnapshot.new.map(card => ({ card, type: 'new' as const }))
		];

		const startedAt = queue.length > 0 ? new Date() : null;

		this.state = {
			status: queue.length > 0 ? 'in-progress' : 'complete',
			startedAt,
			finishedAt: queue.length > 0 ? null : new Date(),
			queue,
			index: 0,
			showingAnswer: false,
			completed: [],
			queueSnapshot: deps.queueSnapshot
		};
	}

	isComplete(): boolean {
		return this.state.status === 'complete';
	}

	getQueueSnapshot(): QueueSnapshot {
		return this.state.queueSnapshot;
	}

	getCurrentCard(): SessionCard | null {
		if (this.isComplete() || this.state.queue.length === 0) {
			return null;
		}
		return this.state.queue[this.state.index] ?? null;
	}

	getCurrentPreview(now?: Date): SchedulerPreview | null {
		const current = this.getCurrentCard();
		if (!current) {
			return null;
		}
		return this.scheduler.getPreview(current.card, now);
	}

	getProgress(): ProgressState {
		return {
			currentIndex: Math.min(this.state.index, Math.max(this.state.queue.length - 1, 0)),
			totalCards: this.state.queue.length + this.state.completed.length,
			completed: this.state.completed.length,
			showingAnswer: this.state.showingAnswer
		};
	}

	toggleAnswer(): void {
		if (this.isComplete()) {
			return;
		}
		this.state.showingAnswer = !this.state.showingAnswer;
	}

	async rateCard(rating: SupportedRating, now = new Date()): Promise<RateResult | null> {
		const current = this.getCurrentCard();
		if (!current) {
			return null;
		}

		const outcome = this.scheduler.applyRating(current.card, rating, now);

		this.storage.updateCard(current.card.id, { fsrsCard: outcome.updatedCard.fsrsCard });
		await this.storage.save();

		this.state.completed.push({
			cardId: current.card.id,
			type: current.type,
			rating,
			outcome,
			completedAt: now
		});

		this.removeCurrentCard();

		if (this.state.queue.length === 0) {
			this.state.status = 'complete';
			this.state.finishedAt = now;
		} else {
			this.state.index = Math.min(this.state.index, this.state.queue.length - 1);
		}

		this.state.showingAnswer = false;

		return {
			outcome,
			remaining: this.state.queue.length,
			completed: this.state.completed.length,
			nextCard: this.getCurrentCard()?.card ?? null
		};
	}

	private removeCurrentCard(): void {
		if (this.state.queue.length === 0) {
			return;
		}
		this.state.queue.splice(this.state.index, 1);
	}

	getSummary(): SessionSummary {
		const reviewedDue = this.state.completed.filter(item => item.type === 'due').length;
		const reviewedNew = this.state.completed.filter(item => item.type === 'new').length;

		return {
			totalReviewed: this.state.completed.length,
			reviewedDue,
			reviewedNew,
			startedAt: this.state.startedAt,
			finishedAt: this.state.finishedAt
		};
	}

	getCompleted(): CompletedCard[] {
		return [...this.state.completed];
	}
}
