/**
 * Quiz View
 * Interactive quiz interface for taking quizzes
 */

import { ItemView, WorkspaceLeaf } from 'obsidian';
import type FlashlyPlugin from '../../main';
import { Quiz, QuizQuestion, checkAnswer, calculateQuizScore } from '../models/quiz';

export const QUIZ_VIEW_TYPE = 'flashly-quiz-view';

export class QuizView extends ItemView {
	plugin: FlashlyPlugin;
	currentQuiz: Quiz | null = null;
	currentQuestionIndex: number = 0;
	private keydownHandler: (evt: KeyboardEvent) => void;

	constructor(leaf: WorkspaceLeaf, plugin: FlashlyPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.keydownHandler = this.handleKeydown.bind(this);
	}

	getViewType(): string {
		return QUIZ_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Quiz';
	}

	getIcon(): string {
		return 'help-circle';
	}

	async onOpen(): Promise<void> {
		this.render();
		document.addEventListener('keydown', this.keydownHandler);
	}

	async onClose(): Promise<void> {
		document.removeEventListener('keydown', this.keydownHandler);
		this.containerEl.empty();
	}

	/**
	 * Load and start a quiz
	 */
	loadQuiz(quiz: Quiz): void {
		this.currentQuiz = quiz;
		this.currentQuestionIndex = 0;
		this.render();
	}

	private render(): void {
		const container = this.containerEl;
		container.empty();
		container.addClass('flashly-quiz-view');

		if (!this.currentQuiz) {
			this.renderNoQuiz(container);
			return;
		}

		if (this.currentQuiz.completed) {
			this.renderResults(container);
			return;
		}

		this.renderQuestion(container);
	}

	private renderNoQuiz(container: HTMLElement): void {
		const emptyState = container.createDiv({ cls: 'quiz-empty-state' });
		emptyState.createDiv({ text: '📝', cls: 'quiz-empty-icon' });
		emptyState.createEl('h3', { text: 'No Quiz Loaded', cls: 'quiz-empty-title' });
		emptyState.createEl('p', {
			text: 'Use the "Generate Quiz" command to create a new quiz.',
			cls: 'quiz-empty-message'
		});
	}

	private renderQuestion(container: HTMLElement): void {
		if (!this.currentQuiz) return;

		const question = this.currentQuiz.questions[this.currentQuestionIndex];
		if (!question) return;

		// Header
		const header = container.createDiv({ cls: 'quiz-header' });
		header.createEl('h2', { text: this.currentQuiz.title, cls: 'quiz-title' });

		// Progress
		const progress = container.createDiv({ cls: 'quiz-progress' });
		const progressBar = progress.createDiv({ cls: 'quiz-progress-bar' });
		const progressFill = progressBar.createDiv({ cls: 'quiz-progress-fill' });
		const percentage = ((this.currentQuestionIndex + 1) / this.currentQuiz.totalQuestions) * 100;
		progressFill.style.width = `${percentage}%`;

		const progressText = progress.createDiv({ cls: 'quiz-progress-text' });
		progressText.setText(`Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.totalQuestions}`);

		// Question content
		const questionContainer = container.createDiv({ cls: 'quiz-question-container' });

		// Question type badge
		const typeBadge = questionContainer.createDiv({ cls: 'quiz-type-badge' });
		typeBadge.setText(this.getQuestionTypeLabel(question.type));
		typeBadge.addClass(`quiz-type-${question.type}`);

		// Question prompt
		questionContainer.createEl('p', { text: question.prompt, cls: 'quiz-question-prompt' });

		// Answer area
		const answerArea = questionContainer.createDiv({ cls: 'quiz-answer-area' });

		if (question.type === 'multiple-choice' && question.options) {
			this.renderMultipleChoice(answerArea, question);
		} else if (question.type === 'fill-blank') {
			this.renderFillBlank(answerArea, question);
		} else if (question.type === 'true-false' && question.options) {
			this.renderTrueFalse(answerArea, question);
		}

		// Navigation
		const nav = container.createDiv({ cls: 'quiz-navigation' });

		if (this.currentQuestionIndex > 0) {
			const prevBtn = nav.createEl('button', { text: '← Previous', cls: 'quiz-nav-btn' });
			prevBtn.addEventListener('click', () => {
				this.currentQuestionIndex--;
				this.render();
			});
		}

		const nextBtn = nav.createEl('button', {
			text: this.currentQuestionIndex < this.currentQuiz.totalQuestions - 1 ? 'Next →' : 'Finish Quiz',
			cls: 'quiz-nav-btn quiz-nav-primary'
		});

		nextBtn.addEventListener('click', () => {
			if (!this.currentQuiz) return;

			if (this.currentQuestionIndex < this.currentQuiz.totalQuestions - 1) {
				this.currentQuestionIndex++;
				this.render();
			} else {
				this.finishQuiz();
			}
		});

		// Keyboard shortcuts hint
		const keyboardHints = container.createDiv({ cls: 'quiz-keyboard-hints' });
		keyboardHints.createEl('span', { text: '⌨️ Shortcuts: ', cls: 'quiz-hint-label' });

		const hints = [
			'←/→ Navigate',
			'Enter/Space Next',
			'Esc Close'
		];

		if (question.type === 'multiple-choice' || question.type === 'true-false') {
			if (question.type === 'multiple-choice') {
				hints.push('1-4 Select');
			} else {
				hints.push('T/F Select');
			}
		}

		hints.forEach((hint, index) => {
			if (index > 0) {
				keyboardHints.createSpan({ text: ' • ', cls: 'quiz-hint-separator' });
			}
			keyboardHints.createSpan({ text: hint, cls: 'quiz-hint-item' });
		});
	}

	private renderMultipleChoice(container: HTMLElement, question: QuizQuestion): void {
		if (!question.options) return;

		question.options.forEach((option, index) => {
			const optionBtn = container.createEl('button', {
				text: option,
				cls: 'quiz-option-btn'
			});

			if (question.userAnswer === index) {
				optionBtn.addClass('quiz-option-selected');
			}

			optionBtn.addEventListener('click', () => {
				question.userAnswer = index;
				this.render();
			});
		});
	}

	private renderFillBlank(container: HTMLElement, question: QuizQuestion): void {
		const input = container.createEl('input', {
			type: 'text',
			cls: 'quiz-input',
			placeholder: 'Type your answer...'
		});

		if (question.userAnswer !== undefined) {
			input.value = String(question.userAnswer);
		}

		input.addEventListener('input', (e) => {
			question.userAnswer = (e.target as HTMLInputElement).value;
		});

		// Auto-focus
		setTimeout(() => input.focus(), 100);
	}

	private renderTrueFalse(container: HTMLElement, question: QuizQuestion): void {
		if (!question.options) return;

		question.options.forEach((option) => {
			const optionBtn = container.createEl('button', {
				text: option,
				cls: 'quiz-option-btn quiz-option-tf'
			});

			const answerValue = option.toLowerCase();
			if (question.userAnswer === answerValue) {
				optionBtn.addClass('quiz-option-selected');
			}

			optionBtn.addEventListener('click', () => {
				question.userAnswer = answerValue;
				this.render();
			});
		});
	}

	private async finishQuiz(): Promise<void> {
		if (!this.currentQuiz) return;

		// Grade all questions
		this.currentQuiz.questions.forEach(question => {
			if (question.userAnswer !== undefined) {
				question.correct = checkAnswer(question, question.userAnswer);
			} else {
				question.correct = false;
			}
		});

		// Calculate score
		const { score, correctCount } = calculateQuizScore(this.currentQuiz);
		this.currentQuiz.score = score;
		this.currentQuiz.correctCount = correctCount;
		this.currentQuiz.completed = new Date();

		// Save quiz
		const quizStorage = this.plugin.quizStorage;
		await quizStorage.updateQuiz(this.currentQuiz);

		// Render results
		this.render();
	}

	private renderResults(container: HTMLElement): void {
		if (!this.currentQuiz) return;

		const resultsContainer = container.createDiv({ cls: 'quiz-results-container' });

		// Score display
		const scoreCard = resultsContainer.createDiv({ cls: 'quiz-score-card' });
		scoreCard.createEl('h2', { text: '🎉 Quiz Complete!', cls: 'quiz-results-title' });

		const scoreDisplay = scoreCard.createDiv({ cls: 'quiz-score-display' });
		const scoreValue = scoreDisplay.createDiv({ cls: 'quiz-score-value' });
		scoreValue.setText(`${this.currentQuiz.score}%`);

		const scoreLabel = scoreDisplay.createDiv({ cls: 'quiz-score-label' });
		scoreLabel.setText(`${this.currentQuiz.correctCount} / ${this.currentQuiz.totalQuestions} correct`);

		// Performance message
		const message = scoreCard.createDiv({ cls: 'quiz-performance-message' });
		if (this.currentQuiz.score! >= 90) {
			message.setText('🌟 Excellent work!');
		} else if (this.currentQuiz.score! >= 70) {
			message.setText('👍 Good job!');
		} else if (this.currentQuiz.score! >= 50) {
			message.setText('📚 Keep practicing!');
		} else {
			message.setText('💪 Review the material and try again!');
		}

		// Question review
		const reviewSection = resultsContainer.createDiv({ cls: 'quiz-review-section' });
		reviewSection.createEl('h3', { text: 'Review Answers', cls: 'quiz-review-title' });

		this.currentQuiz.questions.forEach((question, index) => {
			const questionCard = reviewSection.createDiv({ cls: 'quiz-review-question' });
			questionCard.addClass(question.correct ? 'quiz-review-correct' : 'quiz-review-incorrect');

			const questionHeader = questionCard.createDiv({ cls: 'quiz-review-header' });
			questionHeader.createSpan({ text: `Q${index + 1}: `, cls: 'quiz-review-number' });
			questionHeader.createSpan({ text: question.prompt, cls: 'quiz-review-prompt' });

			const icon = questionHeader.createSpan({ cls: 'quiz-review-icon' });
			icon.setText(question.correct ? '✓' : '✗');

			// Show answer details
			if (!question.correct) {
				const answerDetails = questionCard.createDiv({ cls: 'quiz-answer-details' });

				const yourAnswer = answerDetails.createDiv({ cls: 'quiz-your-answer' });
				yourAnswer.createSpan({ text: 'Your answer: ', cls: 'quiz-answer-label' });
				yourAnswer.createSpan({ text: String(this.getAnswerDisplay(question, question.userAnswer)) });

				const correctAnswer = answerDetails.createDiv({ cls: 'quiz-correct-answer' });
				correctAnswer.createSpan({ text: 'Correct answer: ', cls: 'quiz-answer-label' });
				correctAnswer.createSpan({ text: String(this.getAnswerDisplay(question, question.correctAnswer)) });
			}

			// Show explanation if available
			if (question.explanation) {
				const explanation = questionCard.createDiv({ cls: 'quiz-explanation' });
				explanation.createEl('strong', { text: 'Explanation: ' });
				explanation.createSpan({ text: question.explanation });
			}
		});

		// Actions
		const actions = resultsContainer.createDiv({ cls: 'quiz-results-actions' });

		const newQuizBtn = actions.createEl('button', {
			text: '🔄 New Quiz',
			cls: 'quiz-action-btn quiz-btn-primary'
		});
		newQuizBtn.addEventListener('click', () => {
			this.currentQuiz = null;
			this.render();
		});

		const closeBtn = actions.createEl('button', {
			text: 'Close',
			cls: 'quiz-action-btn'
		});
		closeBtn.addEventListener('click', () => {
			this.leaf.detach();
		});
	}

	private getAnswerDisplay(question: QuizQuestion, answer: any): string {
		if (answer === undefined || answer === null) {
			return '(no answer)';
		}

		if (question.type === 'multiple-choice' && typeof answer === 'number' && question.options) {
			return question.options[answer] || String(answer);
		}

		return String(answer);
	}

	private getQuestionTypeLabel(type: string): string {
		switch (type) {
			case 'multiple-choice':
				return 'Multiple Choice';
			case 'fill-blank':
				return 'Fill in the Blank';
			case 'true-false':
				return 'True/False';
			default:
				return type;
		}
	}

	private handleKeydown(evt: KeyboardEvent): void {
		// Don't handle shortcuts if user is typing in an input field
		const target = evt.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
			return;
		}

		// Don't handle shortcuts if no quiz is loaded or quiz is completed
		if (!this.currentQuiz || this.currentQuiz.completed) {
			return;
		}

		const question = this.currentQuiz.questions[this.currentQuestionIndex];
		if (!question) return;

		// Escape: Close the quiz view
		if (evt.key === 'Escape') {
			evt.preventDefault();
			this.leaf.detach();
			return;
		}

		// Enter or Space: Navigate to next question or finish
		if (evt.key === 'Enter' || evt.key === ' ') {
			evt.preventDefault();
			if (this.currentQuestionIndex < this.currentQuiz.totalQuestions - 1) {
				this.currentQuestionIndex++;
				this.render();
			} else {
				this.finishQuiz();
			}
			return;
		}

		// Arrow Left: Previous question
		if (evt.key === 'ArrowLeft') {
			evt.preventDefault();
			if (this.currentQuestionIndex > 0) {
				this.currentQuestionIndex--;
				this.render();
			}
			return;
		}

		// Arrow Right: Next question
		if (evt.key === 'ArrowRight') {
			evt.preventDefault();
			if (this.currentQuestionIndex < this.currentQuiz.totalQuestions - 1) {
				this.currentQuestionIndex++;
				this.render();
			}
			return;
		}

		// Number keys (1-4) for multiple choice and true/false
		if (question.type === 'multiple-choice' && question.options) {
			const num = parseInt(evt.key);
			if (num >= 1 && num <= question.options.length) {
				evt.preventDefault();
				question.userAnswer = num - 1;
				this.render();
				return;
			}
		}

		// T/F keys for true/false questions
		if (question.type === 'true-false') {
			if (evt.key.toLowerCase() === 't') {
				evt.preventDefault();
				question.userAnswer = 'true';
				this.render();
				return;
			}
			if (evt.key.toLowerCase() === 'f') {
				evt.preventDefault();
				question.userAnswer = 'false';
				this.render();
				return;
			}
		}
	}
}
