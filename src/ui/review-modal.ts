import { App, Modal } from 'obsidian';
import { FlashlyCard } from '../models/card';
import { FSRSScheduler, Rating } from '../scheduler/fsrs-scheduler';

/**
 * Simple review modal for Phase 0 PoC
 * Displays a flashcard and rating buttons
 */
export class ReviewModal extends Modal {
	private card: FlashlyCard;
	private scheduler: FSRSScheduler;
	private showingBack = false;
	
	constructor(app: App, card: FlashlyCard, scheduler: FSRSScheduler) {
		super(app);
		this.card = card;
		this.scheduler = scheduler;
	}
	
	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('flashly-review-modal');
		
		// Title
		const title = contentEl.createEl('h2', { 
			text: 'Flashcard Review (Phase 0 PoC)' 
		});
		title.style.marginBottom = '20px';
		
		// Card container
		const cardContainer = contentEl.createDiv({ cls: 'flashly-card-container' });
		cardContainer.style.minHeight = '200px';
		cardContainer.style.padding = '20px';
		cardContainer.style.border = '2px solid var(--background-modifier-border)';
		cardContainer.style.borderRadius = '8px';
		cardContainer.style.marginBottom = '20px';
		
		// Front of card
		const frontEl = cardContainer.createDiv({ cls: 'flashly-card-front' });
		frontEl.style.fontSize = '18px';
		frontEl.style.marginBottom = '20px';
		frontEl.innerHTML = `<strong>Question:</strong><br>${this.card.front}`;
		
		// Back of card (hidden initially)
		const backEl = cardContainer.createDiv({ cls: 'flashly-card-back' });
		backEl.style.fontSize = '16px';
		backEl.style.display = 'none';
		backEl.innerHTML = `<br><strong>Answer:</strong><br>${this.card.back}`;
		
		// Show Answer button
		const showAnswerBtn = contentEl.createEl('button', { 
			text: 'Show Answer',
			cls: 'mod-cta'
		});
		showAnswerBtn.style.marginBottom = '20px';
		showAnswerBtn.style.padding = '10px 20px';
		showAnswerBtn.onclick = () => {
			backEl.style.display = 'block';
			showAnswerBtn.style.display = 'none';
			ratingContainer.style.display = 'flex';
		};
		
		// Rating buttons container
		const ratingContainer = contentEl.createDiv({ cls: 'flashly-rating-container' });
		ratingContainer.style.display = 'none';
		ratingContainer.style.flexDirection = 'column';
		ratingContainer.style.gap = '10px';
		
		// Get scheduling info
		const schedInfo = this.scheduler.getSchedulingInfo(this.card);
		
		// Create rating buttons
		const ratings = [
			{ rating: Rating.Again, label: 'Again', color: '#e74c3c' },
			{ rating: Rating.Hard, label: 'Hard', color: '#e67e22' },
			{ rating: Rating.Good, label: 'Good', color: '#27ae60' },
			{ rating: Rating.Easy, label: 'Easy', color: '#3498db' }
		];
		
		ratings.forEach(({ rating, label, color }) => {
			const schedInfoArray = Object.values(schedInfo);
			const info = schedInfoArray[rating - 1]; // Rating starts at 1
			const days = Math.round(info.interval);
			const nextReview = this.scheduler.formatDate(info.nextReview);
			
			const btn = ratingContainer.createEl('button', {
				text: `${label} - Review in ${days} day${days !== 1 ? 's' : ''}`,
				cls: 'flashly-rating-btn'
			});
			btn.style.padding = '15px';
			btn.style.fontSize = '16px';
			btn.style.backgroundColor = color;
			btn.style.color = 'white';
			btn.style.border = 'none';
			btn.style.borderRadius = '5px';
			btn.style.cursor = 'pointer';
			btn.style.transition = 'opacity 0.2s';
			
			btn.onmouseenter = () => {
				btn.style.opacity = '0.8';
			};
			btn.onmouseleave = () => {
				btn.style.opacity = '1';
			};
			
			btn.onclick = () => {
				this.handleRating(rating, nextReview);
			};
		});
		
		// Source info
		const sourceInfo = contentEl.createDiv({ cls: 'flashly-source-info' });
		sourceInfo.style.marginTop = '20px';
		sourceInfo.style.fontSize = '12px';
		sourceInfo.style.color = 'var(--text-muted)';
		sourceInfo.innerHTML = `Source: ${this.card.source.file} (Line ${this.card.source.line})`;
	}
	
	private handleRating(rating: Rating, nextReview: string) {
		const result = this.scheduler.review(this.card, rating);
		
		// Update the card's FSRS data
		this.card.fsrsCard = result.card;
		this.card.updated = new Date();
		
		// Show success message
		const { contentEl } = this;
		contentEl.empty();
		
		const successMsg = contentEl.createDiv({ cls: 'flashly-success' });
		successMsg.style.textAlign = 'center';
		successMsg.style.padding = '40px';
		
		successMsg.createEl('h2', { text: '✓ Card Rated!' });
		successMsg.createEl('p', { 
			text: `Next review: ${nextReview}` 
		}).style.fontSize = '16px';
		
		const closeBtn = successMsg.createEl('button', { 
			text: 'Close',
			cls: 'mod-cta'
		});
		closeBtn.style.marginTop = '20px';
		closeBtn.style.padding = '10px 30px';
		closeBtn.onclick = () => this.close();
	}
	
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
