/**
 * Replay Tutorial Command - Opens the tutorial modal
 */

import { App } from 'obsidian';
import { TutorialModal, getTutorialSteps } from '../ui/tutorial-modal';

export class ReplayTutorialCommand {
	constructor(private app: App) {}

	getId(): string {
		return 'replay-tutorial';
	}

	getName(): string {
		return 'Replay Tutorial';
	}

	getCallback(): () => void {
		return () => {
			const modal = new TutorialModal(this.app, {
				steps: getTutorialSteps(),
				onComplete: () => {
					// No action needed for replay
				},
				onSkip: () => {
					// No action needed for replay
				}
			});
			modal.open();
		};
	}
}
