import { Plugin } from 'obsidian';
import { FlashlySettings, DEFAULT_SETTINGS } from './src/settings';
import { FlashlySettingTab } from './src/ui/settings-tab';
import { StorageService } from './src/services/storage-service';
import { FlashcardParser } from './src/parser/flashcard-parser';
import { ScanCommand } from './src/commands/scan-command';
import { FlashcardBrowserView, FLASHCARD_BROWSER_VIEW_TYPE } from './src/ui/flashcard-browser-view';

export default class FlashlyPlugin extends Plugin {
	settings: FlashlySettings;
	storage: StorageService;
	parser: FlashcardParser;
	scanCommand: ScanCommand;

	async onload() {
		// Load settings
		await this.loadSettings();

		// Initialize services
		this.storage = new StorageService(this);
		await this.storage.load();

		this.parser = new FlashcardParser(this.settings.parser, this.app);

		// Register flashcard browser view
		this.registerView(
			FLASHCARD_BROWSER_VIEW_TYPE,
			(leaf) => new FlashcardBrowserView(leaf, this)
		);

		// Initialize commands
		this.scanCommand = new ScanCommand(this.app, this.storage, this.parser);
		this.addCommand({
			id: this.scanCommand.getId(),
			name: this.scanCommand.getName(),
			callback: this.scanCommand.getCallback()
		});

		// Add command to open flashcard browser
		this.addCommand({
			id: 'open-flashcard-browser',
			name: 'Open Flashcard Browser',
			callback: () => this.activateBrowserView()
		});

		// Add ribbon icon for flashcard browser
		this.addRibbonIcon('layers', 'Flashcard Browser', () => {
			this.activateBrowserView();
		});

		// Add settings tab
		this.addSettingTab(new FlashlySettingTab(this.app, this));
	}

	async activateBrowserView() {
		const { workspace } = this.app;
		
		let leaf = workspace.getLeavesOfType(FLASHCARD_BROWSER_VIEW_TYPE)[0];
		
		if (!leaf) {
			// Create new view in right sidebar
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				await rightLeaf.setViewState({
					type: FLASHCARD_BROWSER_VIEW_TYPE,
					active: true
				});
				leaf = rightLeaf;
			}
		}
		
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		
		// Reinitialize parser with new settings
		this.parser = new FlashcardParser(this.settings.parser, this.app);
	}
}

