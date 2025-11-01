/**
 * Generate Quiz Command
 * Allows users to create quizzes from their flashcards
 */

import { App, Modal, Notice, Setting } from 'obsidian';
import type FlashlyPlugin from '../../main';
import { QuizConfig, DEFAULT_QUIZ_CONFIG, createQuiz } from '../models/quiz';
import { TraditionalQuizGenerator } from '../quiz/traditional-quiz-generator';
import { AIQuizGenerator } from '../quiz/ai-quiz-generator';

class GenerateQuizModal extends Modal {
	plugin: FlashlyPlugin;
	config: QuizConfig;

	constructor(app: App, plugin: FlashlyPlugin) {
		super(app);
		this.plugin = plugin;
		this.config = { ...DEFAULT_QUIZ_CONFIG };
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('flashly-generate-quiz-modal');

		contentEl.createEl('h2', { text: 'Generate Quiz' });

		// Quiz Title
		new Setting(contentEl)
			.setName('Quiz title')
			.setDesc('Give your quiz a name')
			.addText(text => {
				text.setPlaceholder('My Quiz');
				text.inputEl.id = 'quiz-title-input';
			});

		// Number of questions
		new Setting(contentEl)
			.setName('Number of questions')
			.setDesc('How many questions to generate')
			.addText(text => {
				text.inputEl.type = 'number';
				text.setValue(String(this.config.questionCount));
				text.onChange(value => {
					const parsed = parseInt(value);
					this.config.questionCount = isNaN(parsed) ? 20 : Math.max(1, parsed);
				});
			});

		// Question types
		contentEl.createEl('h3', { text: 'Question Types' });

		new Setting(contentEl)
			.setName('Multiple choice')
			.setDesc('Include multiple choice questions')
			.addToggle(toggle => {
				toggle.setValue(this.config.includeMultipleChoice);
				toggle.onChange(value => {
					this.config.includeMultipleChoice = value;
				});
			});

		new Setting(contentEl)
			.setName('Fill in the blank')
			.setDesc('Include fill-in-the-blank questions')
			.addToggle(toggle => {
				toggle.setValue(this.config.includeFillBlank);
				toggle.onChange(value => {
					this.config.includeFillBlank = value;
				});
			});

		new Setting(contentEl)
			.setName('True/False')
			.setDesc('Include true/false questions')
			.addToggle(toggle => {
				toggle.setValue(this.config.includeTrueFalse);
				toggle.onChange(value => {
					this.config.includeTrueFalse = value;
				});
			});

		// Deck filter
		new Setting(contentEl)
			.setName('Filter by decks')
			.setDesc('Only include cards from specific decks (comma-separated, leave blank for all)')
			.addText(text => {
				text.setPlaceholder('Biology, Chemistry');
				text.onChange(value => {
					this.config.deckFilter = value
						.split(',')
						.map(d => d.trim())
						.filter(d => d.length > 0);
				});
			});

		// AI Generation
		if (this.plugin.settings.quiz.enabled) {
			contentEl.createEl('h3', { text: 'AI Generation' });

			new Setting(contentEl)
				.setName('Use AI to generate questions')
				.setDesc(`Uses ${this.plugin.settings.quiz.provider.toUpperCase()} to create creative quiz questions`)
				.addToggle(toggle => {
					toggle.setValue(this.config.useAI);
					toggle.onChange(value => {
						this.config.useAI = value;
					});
				});

			// Show warning if API key not configured
			if (this.plugin.settings.quiz.provider === 'openai' && !this.plugin.settings.quiz.openai?.apiKey) {
				contentEl.createDiv({
					text: '⚠️ OpenAI API key not configured. Please configure in settings.',
					cls: 'quiz-warning'
				});
			} else if (this.plugin.settings.quiz.provider === 'anthropic' && !this.plugin.settings.quiz.anthropic?.apiKey) {
				contentEl.createDiv({
					text: '⚠️ Anthropic API key not configured. Please configure in settings.',
					cls: 'quiz-warning'
				});
			} else if (this.plugin.settings.quiz.provider === 'gemini' && !this.plugin.settings.quiz.gemini?.apiKey) {
				contentEl.createDiv({
					text: '⚠️ Gemini API key not configured. Please configure in settings.',
					cls: 'quiz-warning'
				});
			} else if (this.plugin.settings.quiz.provider === 'custom' && (!this.plugin.settings.quiz.custom?.apiKey || !this.plugin.settings.quiz.custom?.baseUrl)) {
				contentEl.createDiv({
					text: '⚠️ Custom API not fully configured. Please configure in settings.',
					cls: 'quiz-warning'
				});
			}
		}

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

		const generateBtn = buttonContainer.createEl('button', {
			text: 'Generate Quiz',
			cls: 'mod-cta'
		});

		generateBtn.addEventListener('click', async () => {
			await this.generateQuiz();
		});

		const cancelBtn = buttonContainer.createEl('button', {
			text: 'Cancel'
		});

		cancelBtn.addEventListener('click', () => {
			this.close();
		});
	}

	async generateQuiz() {
		try {
			// Validate at least one question type
			if (!this.config.includeMultipleChoice && !this.config.includeFillBlank && !this.config.includeTrueFalse) {
				new Notice('Please select at least one question type');
				return;
			}

			// Get quiz title
			const titleInput = this.contentEl.querySelector('#quiz-title-input') as HTMLInputElement;
			const title = titleInput?.value || 'Untitled Quiz';

			// Get cards
			let cards = this.plugin.storage.getAllCards();

			// Apply deck filter if specified
			if (this.config.deckFilter && this.config.deckFilter.length > 0) {
				cards = cards.filter(card =>
					this.config.deckFilter!.some(deck =>
						card.deck.toLowerCase().includes(deck.toLowerCase())
					)
				);
			}

			if (cards.length === 0) {
				new Notice('No cards available. Please scan for flashcards first.');
				return;
			}

			if (cards.length < this.config.questionCount) {
				new Notice(`Only ${cards.length} cards available. Generating ${cards.length} questions instead.`);
				this.config.questionCount = cards.length;
			}

			// Show loading notice
			const loadingNotice = new Notice('Generating quiz...', 0);

			// Generate questions
			let questions;
			let generationMethod: 'traditional' | 'ai-generated';

			if (this.config.useAI && this.plugin.settings.quiz.enabled) {
				// Use AI generator
				generationMethod = 'ai-generated';
				const aiGenerator = new AIQuizGenerator(this.plugin.settings.quiz);
				questions = await aiGenerator.generateQuestions(cards, this.config);
				loadingNotice.hide();
				new Notice('Quiz generated with AI! 🤖');
			} else {
				// Use traditional generator
				generationMethod = 'traditional';
				const traditionalGenerator = new TraditionalQuizGenerator();
				questions = traditionalGenerator.generateQuestions(cards, this.config);
				loadingNotice.hide();
				new Notice('Quiz generated! 📝');
			}

			// Create quiz
			const quiz = createQuiz(
				title,
				questions,
				cards.map(c => c.id),
				this.config,
				generationMethod
			);

			// Save quiz
			await this.plugin.quizStorage.addQuiz(quiz);

			// Open quiz view
			const leaf = this.app.workspace.getLeaf('tab');
			await leaf.setViewState({
				type: 'flashly-quiz-view',
				active: true
			});

			// Load the quiz into the view
			const view = leaf.view;
			if (view && 'loadQuiz' in view) {
				(view as any).loadQuiz(quiz);
			}

			this.close();
		} catch (error) {
			console.error('Failed to generate quiz:', error);
			new Notice(`Failed to generate quiz: ${error.message}`);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class GenerateQuizCommand {
	constructor(
		private app: App,
		private plugin: FlashlyPlugin
	) {}

	getId(): string {
		return 'generate-quiz';
	}

	getName(): string {
		return 'Generate Quiz';
	}

	getCallback(): () => void {
		return () => {
			new GenerateQuizModal(this.app, this.plugin).open();
		};
	}
}
