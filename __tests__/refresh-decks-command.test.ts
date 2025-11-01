import { RefreshDecksCommand } from '../src/commands/refresh-decks-command';
import { createMockApp, createMockPlugin } from './setup';
import { StorageService } from '../src/services/storage-service';
import { FlashlyCard } from '../src/models/card';
import { createEmptyCard, State } from 'ts-fsrs';
import type { App } from 'obsidian';
import { DEFAULT_SETTINGS } from '../src/settings';

function createCard(id: string, deck: string, state: State, dueOffsetMinutes: number): FlashlyCard {
	const fsrsCard = createEmptyCard(new Date());
	fsrsCard.state = state;
	fsrsCard.due = new Date(Date.now() + dueOffsetMinutes * 60 * 1000);

	return {
		id,
		front: `Front ${id}`,
		back: `Back ${id}`,
		deck,
		tags: [],
		needsFilling: false,
		source: { file: `${id}.md`, line: 1 },
		fsrsCard,
		created: new Date(),
		updated: new Date()
	};
}

describe('RefreshDecksCommand', () => {
	let app: App;
	let storage: StorageService;
	let command: RefreshDecksCommand;

	beforeEach(async () => {
		app = createMockApp();
		const plugin = createMockPlugin();
		storage = new StorageService(plugin);
		plugin.loadData.mockResolvedValue(null);
		await storage.load();

		command = new RefreshDecksCommand(app, storage, () => DEFAULT_SETTINGS);
	});

	it('forces matching cards to be ready for review', async () => {
		const targetCard = createCard('target', 'Deck A', State.New, 120);
		const untouchedCard = createCard('untouched', 'Deck B', State.Review, 120);

		storage.addCards([targetCard, untouchedCard]);

		const saveSpy = jest.spyOn(storage, 'save').mockResolvedValue();

		await command.refreshDecks(['Deck A']);

		const updated = storage.getCard('target');
		expect(updated).toBeDefined();
		expect(updated?.fsrsCard.state).toBe(State.Review);
		expect(updated?.fsrsCard.due.getTime()).toBeLessThan(Date.now());

		const unaffected = storage.getCard('untouched');
		expect(unaffected).toBeDefined();
		expect(unaffected?.fsrsCard.due.getTime()).toBeGreaterThan(Date.now());

		expect(saveSpy).toHaveBeenCalled();
	});

	it('skips save when no cards match the selection', async () => {
		const saveSpy = jest.spyOn(storage, 'save').mockResolvedValue();

		await command.refreshDecks(['Nonexistent Deck']);

		expect(saveSpy).not.toHaveBeenCalled();
	});
});
