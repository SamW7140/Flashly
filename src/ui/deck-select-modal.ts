import { App, SuggestModal } from 'obsidian';

const ALL_DECKS_OPTION = 'All decks';

type DeckSelection = string | typeof ALL_DECKS_OPTION;

export class DeckSelectModal extends SuggestModal<DeckSelection> {
	private selection: string[] | undefined | null = null;
	private readonly decks: string[];
	private readonly onSelect: (selection: string[] | undefined | null) => void;

	constructor(app: App, decks: string[], onSelect: (selection: string[] | undefined | null) => void) {
		super(app);
		this.decks = decks;
		this.onSelect = onSelect;
		this.setPlaceholder('Select a deck to review');
	}

	getSuggestions(query: string): DeckSelection[] {
		const normalizedQuery = query.trim().toLowerCase();
		const choices: DeckSelection[] = [ALL_DECKS_OPTION, ...this.decks];

		if (!normalizedQuery) {
			return choices;
		}

		return choices.filter((choice) => choice.toLowerCase().includes(normalizedQuery));
	}

	renderSuggestion(value: DeckSelection, el: HTMLElement): void {
		el.createEl('div', { text: value });
	}

	onChooseSuggestion(item: DeckSelection): void {
		this.selection = item === ALL_DECKS_OPTION ? undefined : [item];
		this.close();
	}

	onClose(): void {
		this.onSelect(this.selection);
	}
}
