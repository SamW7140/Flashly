import { ReviewQueueService } from '../src/services/review-queue';
import { StorageService } from '../src/services/storage-service';
import { FlashlyCard } from '../src/models/card';
import { createEmptyCard, State } from 'ts-fsrs';
import type { Plugin } from 'obsidian';

const BASE_DATE = new Date('2025-01-01T00:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

type CardOverrides = Omit<Partial<FlashlyCard>, 'fsrsCard'> & {
	fsrsCard?: Partial<FlashlyCard['fsrsCard']>;
};

function createCard(overrides: CardOverrides = {}): FlashlyCard {
	const fsrsCard = createEmptyCard(BASE_DATE);

	return {
		id: overrides.id ?? `card-${Math.random()}`,
		front: overrides.front ?? 'Front',
		back: overrides.back ?? 'Back',
		deck: overrides.deck ?? 'Default',
		tags: overrides.tags ?? [],
		needsFilling: overrides.needsFilling ?? false,
		source: overrides.source ?? { file: 'note.md', line: 1 },
		fsrsCard: {
			...fsrsCard,
			...(overrides.fsrsCard ?? {})
		},
		created: overrides.created ?? new Date(BASE_DATE.getTime()),
		updated: overrides.updated ?? new Date(BASE_DATE.getTime())
	};
}

function setupStorage(cards: FlashlyCard[]): StorageService {
	const pluginMock = {
		loadData: jest.fn().mockResolvedValue(null),
		saveData: jest.fn()
	} as unknown as Plugin;

	const storage = new StorageService(pluginMock);
	storage.addCards(cards);
	return storage;
}

describe('ReviewQueueService', () => {
	it('returns due cards up to the configured limit', () => {
		const cards = [
			createCard({
				id: 'due-1',
				fsrsCard: {
					due: new Date(BASE_DATE.getTime() - DAY_MS),
					state: State.Review
				}
			}),
			createCard({
				id: 'due-2',
				fsrsCard: {
					due: new Date(BASE_DATE.getTime() - DAY_MS * 2),
					state: State.Review
				}
			}),
			createCard({
				id: 'due-3',
				fsrsCard: {
					due: new Date(BASE_DATE.getTime() - DAY_MS * 3),
					state: State.Review
				}
			}),
			createCard({
				id: 'new-1',
				fsrsCard: {
					state: State.New,
					due: new Date(BASE_DATE.getTime() + DAY_MS)
				}
			})
		];

		const storage = setupStorage(cards);
		const queue = new ReviewQueueService(storage);
		const snapshot = queue.build({
			limitDue: 2,
			limitNew: 1,
			now: BASE_DATE
		});

		expect(snapshot.due).toHaveLength(2);
		expect(snapshot.due.map(card => card.id)).toEqual(['due-3', 'due-2']);
		expect(snapshot.remainingDue).toBe(1);
		expect(snapshot.totalDue).toBe(3);
	});

	it('separates new cards from due cards', () => {
		const cards = [
			createCard({
				id: 'new-1',
				created: new Date(BASE_DATE.getTime() - DAY_MS),
				fsrsCard: {
					state: State.New,
					due: BASE_DATE
				}
			}),
			createCard({
				id: 'new-2',
				created: new Date(BASE_DATE.getTime() - DAY_MS * 2),
				fsrsCard: {
					state: State.New,
					due: BASE_DATE
				}
			})
		];

		const storage = setupStorage(cards);
		const queue = new ReviewQueueService(storage);
		const snapshot = queue.build({
			limitDue: 5,
			limitNew: 1,
			now: BASE_DATE
		});

		expect(snapshot.due).toHaveLength(0);
		expect(snapshot.new).toHaveLength(1);
		expect(snapshot.new[0].id).toBe('new-2');
		expect(snapshot.remainingNew).toBe(1);
	});

	it('filters by deck when provided', () => {
		const cards = [
			createCard({
				id: 'math',
				deck: 'Math',
				fsrsCard: {
					due: new Date(BASE_DATE.getTime() - DAY_MS),
					state: State.Review
				}
			}),
			createCard({
				id: 'history',
				deck: 'History',
				fsrsCard: {
					due: new Date(BASE_DATE.getTime() - DAY_MS),
					state: State.Review
				}
			})
		];

		const storage = setupStorage(cards);
		const queue = new ReviewQueueService(storage);
		const snapshot = queue.build({
			decks: ['math'],
			now: BASE_DATE
		});

		expect(snapshot.due).toHaveLength(1);
		expect(snapshot.due[0].deck).toBe('Math');
	});

	it('excludes cards needing filling when requested', () => {
		const cards = [
			createCard({
				id: 'complete',
				fsrsCard: {
					due: new Date(BASE_DATE.getTime() - DAY_MS),
					state: State.Review
				}
			}),
			createCard({
				id: 'incomplete',
				needsFilling: true,
				fsrsCard: {
					due: new Date(BASE_DATE.getTime() - DAY_MS),
					state: State.Review
				}
			})
		];

		const storage = setupStorage(cards);
		const queue = new ReviewQueueService(storage);
		const snapshot = queue.build({
			excludeEmptyAnswers: true,
			now: BASE_DATE
		});

		expect(snapshot.due).toHaveLength(1);
		expect(snapshot.due[0].id).toBe('complete');
	});

	it('throws when limits are negative', () => {
		const cards = [
			createCard({
				fsrsCard: {
					due: new Date(BASE_DATE.getTime() - DAY_MS),
					state: State.Review
				}
			})
		];

		const storage = setupStorage(cards);
		const queue = new ReviewQueueService(storage);

		expect(() =>
			queue.build({
				limitDue: -1
			})
		).toThrow('Queue limits must be non-negative.');
	});
});
