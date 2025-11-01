import { FSRSScheduler } from '../src/scheduler/fsrs-scheduler';
import { SM2Scheduler } from '../src/scheduler/sm2-scheduler';
import { createEmptyCard, Rating, State } from 'ts-fsrs';
import { FlashlyCard } from '../src/models/card';

const FIXED_NOW = new Date('2025-01-01T12:00:00.000Z');

type SchedulerCardOverrides = Omit<Partial<FlashlyCard>, 'fsrsCard'> & {
	fsrsCard?: Partial<FlashlyCard['fsrsCard']>;
};

function makeCard(overrides: SchedulerCardOverrides = {}): FlashlyCard {
	const fsrsCard = createEmptyCard(FIXED_NOW);
	return {
		id: overrides.id ?? 'card-1',
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
		created: overrides.created ?? FIXED_NOW,
		updated: overrides.updated ?? FIXED_NOW
	};
}

describe('FSRSScheduler', () => {
	it('provides preview and apply flows', () => {
		const scheduler = new FSRSScheduler(() => FIXED_NOW, { enable_fuzz: false });
		const card = makeCard();

		const preview = scheduler.getPreview(card, FIXED_NOW);
		expect(preview[Rating.Again]).toBeDefined();
		expect(preview[Rating.Good]).toBeDefined();

		const outcome = scheduler.applyRating(card, Rating.Good, FIXED_NOW);
		expect(outcome.updatedCard.fsrsCard.due.getTime()).toBeGreaterThan(FIXED_NOW.getTime());
		expect(outcome.updatedCard.fsrsCard.state).toBeDefined();
	});
});

describe('SM2Scheduler', () => {
	it('schedules cards with deterministic intervals', () => {
		const scheduler = new SM2Scheduler(() => FIXED_NOW);
		const card = makeCard({
			fsrsCard: {
				state: State.New,
				reps: 0
			}
		});

		const preview = scheduler.getPreview(card, FIXED_NOW);
		expect(preview[Rating.Again].intervalDays).toBeGreaterThan(0);
		expect(preview[Rating.Good].intervalDays).toBe(1);

		const outcome = scheduler.applyRating(card, Rating.Easy, FIXED_NOW);
		expect(outcome.updatedCard.fsrsCard.reps).toBe(1);
		expect(outcome.updatedCard.fsrsCard.due.getTime()).toBeGreaterThan(FIXED_NOW.getTime());
	});
});
