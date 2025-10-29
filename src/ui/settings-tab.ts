/**
 * Settings UI for Flashly plugin
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import type FlashlyPlugin from '../../main';

export class FlashlySettingTab extends PluginSettingTab {
	plugin: FlashlyPlugin;

	constructor(app: App, plugin: FlashlyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Flashly Settings' });

		// Inline Parser Settings
		containerEl.createEl('h3', { text: 'Inline Flashcards' });

		new Setting(containerEl)
			.setName('Enable inline flashcards')
			.setDesc('Parse Q::A, ??, and {cloze} formats')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.parser.inline.enabled)
				.onChange(async (value) => {
					this.plugin.settings.parser.inline.enabled = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show/hide dependent settings
				}));

		if (this.plugin.settings.parser.inline.enabled) {
			new Setting(containerEl)
				.setName('Enable Q::A format')
				.setDesc('Single-line question::answer format')
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.parser.inline.enableQA)
					.onChange(async (value) => {
						this.plugin.settings.parser.inline.enableQA = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Enable ?? format')
				.setDesc('Multi-line question/answer format')
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.parser.inline.enableMultiLine)
					.onChange(async (value) => {
						this.plugin.settings.parser.inline.enableMultiLine = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Enable {cloze} format')
				.setDesc('Cloze deletion format')
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.parser.inline.enableCloze)
					.onChange(async (value) => {
						this.plugin.settings.parser.inline.enableCloze = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Create empty cards')
				.setDesc('Create flashcards even when answer is empty')
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.parser.inline.createEmptyCards)
					.onChange(async (value) => {
						this.plugin.settings.parser.inline.createEmptyCards = value;
						await this.plugin.saveSettings();
					}));
		}

		// Header Parser Settings
		containerEl.createEl('h3', { text: 'Header-Based Flashcards' });

		new Setting(containerEl)
			.setName('Enable header-based flashcards')
			.setDesc('Convert headers in tagged notes to flashcards')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.parser.header.enabled)
				.onChange(async (value) => {
					this.plugin.settings.parser.header.enabled = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show/hide dependent settings
				}));

		if (this.plugin.settings.parser.header.enabled) {
			new Setting(containerEl)
				.setName('Flashcard tags')
				.setDesc('Tags that mark notes for header parsing (comma-separated)')
				.addText(text => text
					.setPlaceholder('flashcards, cards')
					.setValue(this.plugin.settings.parser.header.flashcardTags.join(', '))
					.onChange(async (value) => {
						this.plugin.settings.parser.header.flashcardTags = 
							value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Header levels')
				.setDesc('Which header levels to convert (2-6, comma-separated)')
				.addText(text => text
					.setPlaceholder('2, 3, 4, 5, 6')
					.setValue(this.plugin.settings.parser.header.headerLevels.join(', '))
					.onChange(async (value) => {
						const levels = value.split(',')
							.map(l => parseInt(l.trim()))
							.filter(l => l >= 2 && l <= 6);
						this.plugin.settings.parser.header.headerLevels = levels;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Deck name priority')
				.setDesc('Order to determine deck name: frontmatter, title, subtags')
				.addDropdown(dropdown => dropdown
					.addOption('frontmatter,title,subtags', 'Frontmatter → Title → Subtags')
					.addOption('title,frontmatter,subtags', 'Title → Frontmatter → Subtags')
					.addOption('frontmatter,subtags,title', 'Frontmatter → Subtags → Title')
					.setValue(this.plugin.settings.parser.header.deckNamePriority.join(','))
					.onChange(async (value) => {
						this.plugin.settings.parser.header.deckNamePriority = 
							value.split(',') as ('frontmatter' | 'title' | 'subtags')[];
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Use subtags for deck names')
				.setDesc('Use #flashcards/math as deck name')
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.parser.header.useSubtags)
					.onChange(async (value) => {
						this.plugin.settings.parser.header.useSubtags = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Answer terminator')
				.setDesc('How to determine where answer ends')
				.addDropdown(dropdown => dropdown
					.addOption('next-header', 'Next header')
					.addOption('blank-line', 'Blank line')
					.addOption('hr', 'Horizontal rule')
					.setValue(this.plugin.settings.parser.header.answerTerminator)
					.onChange(async (value) => {
						this.plugin.settings.parser.header.answerTerminator = 
							value as 'next-header' | 'blank-line' | 'hr';
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Create empty cards')
				.setDesc('Create flashcards even when answer is empty')
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.parser.header.createEmptyCards)
					.onChange(async (value) => {
						this.plugin.settings.parser.header.createEmptyCards = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Enable exclusion comments')
				.setDesc('Allow %%NO_FLASHCARD%% to skip headers')
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.parser.header.enableExclusion)
					.onChange(async (value) => {
						this.plugin.settings.parser.header.enableExclusion = value;
						await this.plugin.saveSettings();
					}));

			if (this.plugin.settings.parser.header.enableExclusion) {
				new Setting(containerEl)
					.setName('Exclusion comment')
					.setDesc('Comment text to exclude headers')
					.addText(text => text
						.setPlaceholder('%%NO_FLASHCARD%%')
						.setValue(this.plugin.settings.parser.header.exclusionComment)
						.onChange(async (value) => {
							this.plugin.settings.parser.header.exclusionComment = value;
							await this.plugin.saveSettings();
						}));
			}
		}

		// Mixed Formats
		containerEl.createEl('h3', { text: 'Advanced' });

		new Setting(containerEl)
			.setName('Allow mixed formats')
			.setDesc('Allow both inline and header flashcards in same note')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.parser.mixedFormats)
				.onChange(async (value) => {
					this.plugin.settings.parser.mixedFormats = value;
					await this.plugin.saveSettings();
				}));
	}
}
