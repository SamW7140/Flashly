import { ReviewSessionViewModel } from '../src/viewmodels/review-session-viewmodel';
import { createMockPlugin } from './setup';
import { StorageService } from '../src/services/storage-service';
import { FlashlyCard } from '../src/models/card';
import { createEmptyCard, Rating, State } from 'ts-fsrs';
import { QueueSnapshot } from '../src/services/review-queue';
import { SchedulerPreview, SchedulerStrategy, SupportedRating, ReviewOutcome, RATING_LABELS } from '../src/scheduler/scheduler-types';

const BASE_NOW = new Date('2025-02-01T08:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

class StubScheduler implements SchedulerStrategy {
	getPreview(card: FlashlyCard): SchedulerPreview {
		const baseDue = new Date(BASE_NOW.getTime() + DAY_MS);
		return {
			[Rating.Again]: {
				rating: Rating.Again,
				label: RATING_LABELS[Rating.Again],
				nextReview: baseDue,
				intervalDays: 0.1
			},
			[Rating.Hard]: {
				rating: Rating.Hard,
				label: RATING_LABELS[Rating.Hard],
				nextReview: baseDue,
				intervalDays: 1
			},
			[Rating.Good]: {
				rating: Rating.Good,
				label: RATING_LABELS[Rating.Good],
				nextReview: baseDue,
				intervalDays: 2
			},
			[Rating.Easy]: {
				rating: Rating.Easy,
				label: RATING_LABELS[Rating.Easy],
				nextReview: baseDue,
				intervalDays: 4
			}
		};
	}

	applyRating(card: FlashlyCard, rating: SupportedRating): ReviewOutcome {
		const nextDue = new Date(BASE_NOW.getTime() + rating * DAY_MS);
		const updatedCard: FlashlyCard = {
			...card,
			fsrsCard: {
				...card.fsrsCard,
				due: nextDue,
				scheduled_days: rating,
				state: State.Review
			},
			updated: BASE_NOW
		};

		return {
			updatedCard,
			rating,
			nextReview: nextDue,
			intervalDays: rating,
			log: { rating }
		};
	}
}

function createCard(id: string, deck: string, state: State): FlashlyCard {
	const fsrsCard = createEmptyCard(BASE_NOW);
	fsrsCard.state = state;
	fsrsCard.due = new Date(BASE_NOW.getTime() - DAY_MS);
	fsrsCard.scheduled_days = 1;

	return {
		id,
		front: `Front ${id}`,
		back: `Back ${id}`,
		deck,
		tags: [],
		needsFilling: false,
		source: { file: `${id}.md`, line: 1 },
		fsrsCard,
		created: BASE_NOW,
		updated: BASE_NOW
	};
}

function createQueueSnapshot(due: FlashlyCard[], fresh: FlashlyCard[]): QueueSnapshot {
	return {
		due,
		new: fresh,
		remainingDue: 0,
		remainingNew: 0,
		totalDue: due.length,
		totalNew: fresh.length,
		generatedAt: BASE_NOW
	};
}

describe('ReviewSessionViewModel', () => {
	let storage: StorageService;
	let scheduler: SchedulerStrategy;

	beforeEach(async () => {
		const plugin = createMockPlugin();
		storage = new StorageService(plugin);
		scheduler = new StubScheduler();

		plugin.loadData.mockResolvedValue(null);
		await storage.load();
	});

	it('walks through cards and records completion', async () => {
		const dueCard = createCard('due-1', 'Math', State.Review);
		const newCard = createCard('new-1', 'Science', State.New);

		storage.addCards([dueCard, newCard]);

		const snapshot = createQueueSnapshot([dueCard], [newCard]);
		const viewModel = new ReviewSessionViewModel({
			storage,
			scheduler,
			queueSnapshot: snapshot
		});

		expect(viewModel.isComplete()).toBe(false);
		expect(viewModel.getCurrentCard()?.card.id).toBe('due-1');

		viewModel.toggleAnswer();
		expect(viewModel.getProgress().showingAnswer).toBe(true);

		await viewModel.rateCard(Rating.Good, BASE_NOW);
		expect(viewModel.getCompleted()).toHaveLength(1);
		expect(viewModel.getProgress().completed).toBe(1);

		await viewModel.rateCard(Rating.Good, BASE_NOW);
		expect(viewModel.isComplete()).toBe(true);

		const summary = viewModel.getSummary();
		expect(summary.totalReviewed).toBe(2);
		expect(summary.reviewedDue).toBe(1);
		expect(summary.reviewedNew).toBe(1);
	});
});
