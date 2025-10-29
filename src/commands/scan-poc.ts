import { App, Notice, MarkdownView, Command } from 'obsidian';
import { parseSimpleFlashcards } from '../parser/simple-parser';
import { FSRSScheduler } from '../scheduler/fsrs-scheduler';
import { ReviewModal } from '../ui/review-modal';

/**
 * Phase 0 PoC: Scan active note for Q::A flashcards
 */
export function registerScanPoCCommand(app: App, addCommand: (command: Command) => Command) {
	addCommand({
		id: 'flashly-scan-poc',
		name: 'Scan Active Note (Phase 0 PoC)',
		callback: async () => {
			// Get active markdown view
			const view = app.workspace.getActiveViewOfType(MarkdownView);
			
			if (!view) {
				new Notice('Please open a markdown note first');
				return;
			}
			
			// Get note content and path
			const file = view.file;
			if (!file) {
				new Notice('No active file');
				return;
			}
			
			const content = await app.vault.read(file);
			
			// Parse flashcards
			const cards = parseSimpleFlashcards(content, file.path);
			
			if (cards.length === 0) {
				new Notice('No flashcards found. Use format: Question::Answer');
				return;
			}
			
			new Notice(`Found ${cards.length} flashcard${cards.length !== 1 ? 's' : ''}!`);
			
			// For PoC, just show the first card in a review modal
			const scheduler = new FSRSScheduler();
			const modal = new ReviewModal(app, cards[0], scheduler);
			modal.open();
			
			console.log('Parsed cards:', cards);
		}
	});
}
