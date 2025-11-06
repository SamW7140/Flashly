import { App, SuggestModal } from 'obsidian';

const ALL_DECKS_OPTION = Symbol('ALL_DECKS');
const ALL_DECKS_LABEL = 'All decks';

type DeckSelection = string | symbol;

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

		return choices.filter((choice) => {
			if (choice === ALL_DECKS_OPTION) {
				return ALL_DECKS_LABEL.toLowerCase().includes(normalizedQuery);
			}
			return (choice as string).toLowerCase().includes(normalizedQuery);
		});
	}

	renderSuggestion(value: DeckSelection, el: HTMLElement): void {
		const displayText = value === ALL_DECKS_OPTION ? ALL_DECKS_LABEL : value as string;
		el.createEl('div', { text: displayText });
	}

	onChooseSuggestion(item: DeckSelection): void {
		this.selection = item === ALL_DECKS_OPTION ? undefined : [item as string];
		this.close();
	}

	onClose(): void {
		this.onSelect(this.selection);
	}
}
