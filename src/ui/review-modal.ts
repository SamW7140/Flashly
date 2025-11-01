import { App, Modal, Notice } from 'obsidian';
import { Rating } from 'ts-fsrs';
import { SupportedRating } from '../scheduler/scheduler-types';
import { ReviewSessionViewModel, SessionSummary } from '../viewmodels/review-session-viewmodel';

interface ReviewModalOptions {
	enableKeyboardShortcuts: boolean;
	onComplete?: (summary: SessionSummary) => void;
}

const RATING_ORDER: SupportedRating[] = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy];

export class ReviewModal extends Modal {
	private frontEl!: HTMLElement;
	private backEl!: HTMLElement;
	private toggleBtn!: HTMLButtonElement;
	private progressEl!: HTMLElement;
	private readonly ratingButtons = new Map<SupportedRating, HTMLButtonElement>();
	private readonly boundKeydown: (event: KeyboardEvent) => void;

	constructor(
		app: App,
		private readonly viewModel: ReviewSessionViewModel,
		private readonly options: ReviewModalOptions
	) {
		super(app);
		this.boundKeydown = (event: KeyboardEvent) => this.handleKeydown(event);
	}

	onOpen(): void {
		if (this.viewModel.isComplete()) {
			new Notice('No cards available for review.');
			this.close();
			return;
		}

		this.buildLayout();
		this.render();

		if (this.options.enableKeyboardShortcuts) {
			window.addEventListener('keydown', this.boundKeydown);
		}
	}

	onClose(): void {
		this.contentEl.empty();
		if (this.options.enableKeyboardShortcuts) {
			window.removeEventListener('keydown', this.boundKeydown);
		}
	}

	private buildLayout(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('flashly-review-modal');

		const title = contentEl.createEl('h2', { text: 'Flashly Review Session' });
		title.addClass('flashly-review-title');

		const cardContainer = contentEl.createDiv({ cls: 'flashly-card-container' });
		this.frontEl = cardContainer.createDiv({ cls: 'flashly-card-front' });
		this.backEl = cardContainer.createDiv({ cls: 'flashly-card-back' });

		this.toggleBtn = contentEl.createEl('button', {
			text: 'Show answer',
			cls: 'mod-cta flashly-toggle-btn'
		});
		this.toggleBtn.addEventListener('click', () => {
			this.viewModel.toggleAnswer();
			this.renderCard();
		});

		const ratingsContainer = contentEl.createDiv({ cls: 'flashly-rating-container' });
		RATING_ORDER.forEach((rating) => {
			const button = ratingsContainer.createEl('button', {
				text: '...',
				cls: 'flashly-rating-btn'
			});
			button.addEventListener('click', () => {
				void this.handleRating(rating);
			});
			this.ratingButtons.set(rating, button);
		});

		this.progressEl = contentEl.createDiv({ cls: 'flashly-session-progress' });
	}

	private render(): void {
		if (this.viewModel.isComplete()) {
			this.renderSummary();
			this.options.onComplete?.(this.viewModel.getSummary());
			return;
		}

		this.renderCard();
		this.renderRatings();
		this.renderProgress();
	}

	private renderCard(): void {
		const current = this.viewModel.getCurrentCard();
		if (!current) {
			return;
		}

		this.frontEl.setText(current.card.front);
		this.backEl.setText(current.card.back);

		const showingAnswer = this.viewModel.getProgress().showingAnswer;
		this.backEl.toggleClass('is-visible', showingAnswer);
		this.toggleBtn.setText(showingAnswer ? 'Hide answer' : 'Show answer');
	}

	private renderRatings(): void {
		const preview = this.viewModel.getCurrentPreview();
		if (!preview) {
			return;
		}

		RATING_ORDER.forEach((rating) => {
			const info = preview[rating];
			const button = this.ratingButtons.get(rating);
			if (!info || !button) {
				return;
			}

			const intervalLabel = this.formatInterval(info.intervalDays);
			button.setText(`${info.label} - ${intervalLabel}`);
			button.setAttr('data-rating', info.label.toLowerCase());
		});
	}

	private renderProgress(): void {
		const progress = this.viewModel.getProgress();
		const snapshot = this.viewModel.getQueueSnapshot();

		const dueRemaining = Math.max(snapshot.totalDue - this.countCompletedOfType('due'), 0);
		const newRemaining = Math.max(snapshot.totalNew - this.countCompletedOfType('new'), 0);

		this.progressEl.setText(
			`${progress.completed}/${progress.totalCards} reviewed - ${dueRemaining} due remaining - ${newRemaining} new remaining`
		);
	}

	private countCompletedOfType(type: 'due' | 'new'): number {
		return this.viewModel.getCompleted().filter(item => item.type === type).length;
	}

	private async handleRating(rating: SupportedRating): Promise<void> {
		if (this.viewModel.isComplete()) {
			return;
		}

		await this.viewModel.rateCard(rating);
		this.render();
	}

	private handleKeydown(evt: KeyboardEvent): void {
		if (evt.defaultPrevented) {
			return;
		}

		switch (evt.key) {
			case ' ':
				evt.preventDefault();
				this.viewModel.toggleAnswer();
				this.renderCard();
				break;
			case '1':
				evt.preventDefault();
				void this.handleRating(Rating.Again);
				break;
			case '2':
				evt.preventDefault();
				void this.handleRating(Rating.Hard);
				break;
			case '3':
				evt.preventDefault();
				void this.handleRating(Rating.Good);
				break;
			case '4':
				evt.preventDefault();
				void this.handleRating(Rating.Easy);
				break;
			case 'Escape':
				evt.preventDefault();
				this.close();
				break;
		}
	}

	private renderSummary(): void {
		const summary = this.viewModel.getSummary();
		const { contentEl } = this;
		contentEl.empty();

		const container = contentEl.createDiv({ cls: 'flashly-summary-container' });
		container.createEl('h2', { text: 'Review session complete!' });
		container.createEl('p', {
			text: `Reviewed ${summary.totalReviewed} card${summary.totalReviewed === 1 ? '' : 's'}.`
		});

		const list = container.createEl('ul');
		list.createEl('li', { text: `${summary.reviewedDue} due cards` });
		list.createEl('li', { text: `${summary.reviewedNew} new cards` });

		const closeBtn = container.createEl('button', {
			text: 'Close',
			cls: 'mod-cta'
		});
		closeBtn.addEventListener('click', () => this.close());
	}

	private formatInterval(intervalDays: number): string {
		if (intervalDays < 1) {
			const minutes = Math.round(intervalDays * 24 * 60);
			if (minutes < 60) {
				return `${minutes} minute${minutes === 1 ? '' : 's'}`;
			}
			const hours = Math.round(intervalDays * 24);
			return `${hours} hour${hours === 1 ? '' : 's'}`;
		}

		if (intervalDays < 7) {
			const days = Math.round(intervalDays);
			return `${days} day${days === 1 ? '' : 's'}`;
		}

		const weeks = Math.round(intervalDays / 7);
		return `${weeks} week${weeks === 1 ? '' : 's'}`;
	}
}
