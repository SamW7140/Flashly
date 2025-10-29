import { ItemView, WorkspaceLeaf, Notice, TFile } from 'obsidian';
import { BrowserViewModel, BrowserViewMode, DeckInfo } from '../viewmodels/browser-viewmodel';
import { FlashlyCard } from '../models/card';
import type FlashlyPlugin from '../../main';

export const FLASHCARD_BROWSER_VIEW_TYPE = 'flashcard-browser-view';

type DeckSortOption = 'name-asc' | 'name-desc' | 'cards-desc' | 'due-desc' | 'studied-desc';

export class FlashcardBrowserView extends ItemView {
  private viewModel: BrowserViewModel;
  private plugin: FlashlyPlugin;
  private deckSearchQuery = '';
  private deckSortBy: DeckSortOption = 'name-asc';

  constructor(leaf: WorkspaceLeaf, plugin: FlashlyPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.viewModel = new BrowserViewModel([]);
  }

  getViewType(): string {
    return FLASHCARD_BROWSER_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Flashcard Browser';
  }

  getIcon(): string {
    return 'layers';
  }

  async onOpen() {
    // Load cards from storage
    await this.refreshCards();

    // Initial render
    this.render();

    // Register keyboard handlers
    this.registerDomEvent(this.containerEl, 'keydown', (evt: KeyboardEvent) => {
      this.handleKeyPress(evt);
    });

    // Make view focusable
    this.containerEl.setAttribute('tabindex', '-1');
  }

  /**
   * Refresh cards from storage
   */
  private async refreshCards() {
    const cards = this.plugin.storage.getAllCards();
    this.viewModel.setCards(cards);
    this.render();
  }

  /**
   * Render the entire view based on current mode
   */
  private render() {
    const container = this.contentEl;
    container.empty();
    container.addClass('flashcard-browser-view');

    const state = this.viewModel.getViewState();

    if (state.mode === BrowserViewMode.DECK_LIST) {
      this.renderDeckListView(container);
    } else {
      this.renderCardView(container);
    }
  }

  // ====== DECK LIST VIEW ======

  /**
   * Render the deck list view
   */
  private renderDeckListView(container: HTMLElement) {
    const deckListContainer = container.createDiv({ cls: 'deck-list-view' });

    // Header with stats
    this.renderDeckListHeader(deckListContainer);

    // Search box
    this.renderDeckSearch(deckListContainer);

    // Deck grid
    this.renderDeckGrid(deckListContainer);
  }

  /**
   * Render deck list header with overall statistics
   */
  private renderDeckListHeader(container: HTMLElement) {
    const header = container.createDiv({ cls: 'deck-list-header' });

    header.createEl('h2', {
      text: 'Your Decks',
      cls: 'deck-list-title',
    });

    const stats = this.viewModel.getStatistics();
    const statsText = header.createDiv({ cls: 'deck-list-stats' });
    statsText.createSpan({ text: `${stats.deckCount} decks` });
    statsText.createSpan({ text: ' • ' });
    statsText.createSpan({ text: `${stats.totalCards} total cards` });
    statsText.createSpan({ text: ' • ' });
    statsText.createSpan({ text: `${stats.cardsDueToday} due today` });

    // Refresh button
    const refreshBtn = header.createEl('button', {
      cls: 'deck-refresh-btn',
      text: '🔄',
      attr: { 'aria-label': 'Refresh' },
    });
    refreshBtn.addEventListener('click', () => {
      this.refreshCards();
      new Notice('Refreshed flashcard browser');
    });
  }

  /**
   * Render deck search box
   */
  private renderDeckSearch(container: HTMLElement) {
    const searchRow = container.createDiv({ cls: 'deck-search-row' });
    
    // Search input
    const searchContainer = searchRow.createDiv({ cls: 'deck-search' });
    const searchInput = searchContainer.createEl('input', {
      type: 'text',
      placeholder: 'Search decks...',
      cls: 'deck-search-input',
      value: this.deckSearchQuery,
    });

    searchInput.addEventListener('input', (evt: Event) => {
      this.deckSearchQuery = (evt.target as HTMLInputElement).value;
      this.render();
    });

    // Sort dropdown
    const sortContainer = searchRow.createDiv({ cls: 'deck-sort' });
    sortContainer.createSpan({ cls: 'deck-sort-label', text: 'Sort: ' });
    const sortSelect = sortContainer.createEl('select', { cls: 'deck-sort-select' });

    const sortOptions: Array<{ value: DeckSortOption; label: string }> = [
      { value: 'name-asc', label: 'Name (A-Z)' },
      { value: 'name-desc', label: 'Name (Z-A)' },
      { value: 'cards-desc', label: 'Most Cards' },
      { value: 'due-desc', label: 'Most Due' },
      { value: 'studied-desc', label: 'Recently Studied' },
    ];

    for (const opt of sortOptions) {
      const option = sortSelect.createEl('option', { value: opt.value, text: opt.label });
      if (opt.value === this.deckSortBy) {
        option.selected = true;
      }
    }

    sortSelect.addEventListener('change', (evt: Event) => {
      this.deckSortBy = (evt.target as HTMLSelectElement).value as DeckSortOption;
      this.render();
    });
  }

  /**
   * Sort decks based on current sort option
   */
  private sortDecks(decks: DeckInfo[]): DeckInfo[] {
    const sorted = [...decks];
    
    switch (this.deckSortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'cards-desc':
        sorted.sort((a, b) => b.totalCards - a.totalCards);
        break;
      case 'due-desc':
        sorted.sort((a, b) => b.dueToday - a.dueToday);
        break;
      case 'studied-desc':
        sorted.sort((a, b) => {
          if (!a.lastStudied && !b.lastStudied) return 0;
          if (!a.lastStudied) return 1;
          if (!b.lastStudied) return -1;
          return b.lastStudied.getTime() - a.lastStudied.getTime();
        });
        break;
    }
    
    return sorted;
  }

  /**
   * Render grid of deck cards
   */
  private renderDeckGrid(container: HTMLElement) {
    const deckList = this.viewModel.getDeckList();

    // Filter by search query
    const filteredDecks = this.deckSearchQuery
      ? deckList.filter((deck) =>
          deck.name.toLowerCase().includes(this.deckSearchQuery.toLowerCase())
        )
      : deckList;

    // Sort decks
    const sortedDecks = this.sortDecks(filteredDecks);

    const grid = container.createDiv({ cls: 'deck-grid' });

    if (sortedDecks.length === 0) {
      this.renderDeckListEmptyState(grid);
      return;
    }

    for (const deck of sortedDecks) {
      this.renderDeckCard(grid, deck);
    }
  }

  /**
   * Render individual deck card
   */
  private renderDeckCard(container: HTMLElement, deck: DeckInfo) {
    const card = container.createDiv({ cls: 'deck-card' });

    // Header
    const header = card.createDiv({ cls: 'deck-card-header' });
    header.createSpan({ cls: 'deck-icon', text: '📚' });
    header.createSpan({ cls: 'deck-name', text: deck.name });

    // Statistics
    const stats = card.createDiv({ cls: 'deck-stats' });

    const totalStat = stats.createDiv({ cls: 'deck-stat' });
    totalStat.createDiv({ cls: 'deck-stat-value', text: deck.totalCards.toString() });
    totalStat.createDiv({ cls: 'deck-stat-label', text: 'Total cards' });

    const dueStat = stats.createDiv({ cls: 'deck-stat' });
    dueStat.createDiv({ cls: 'deck-stat-value', text: deck.dueToday.toString() });
    dueStat.createDiv({ cls: 'deck-stat-label', text: 'Due today' });

    // Last studied
    const lastStudied = card.createDiv({ cls: 'deck-last-studied' });
    if (deck.lastStudied) {
      const daysAgo = Math.floor(
        (Date.now() - deck.lastStudied.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysAgo === 0) {
        lastStudied.setText('Studied today');
      } else if (daysAgo === 1) {
        lastStudied.setText('Last studied yesterday');
      } else {
        lastStudied.setText(`Last studied ${daysAgo} days ago`);
      }
    } else {
      lastStudied.setText('Never studied');
    }

    // Study button
    const studyBtn = card.createEl('button', {
      cls: 'deck-study-btn',
      text: `Study Deck →`,
    });
    studyBtn.addEventListener('click', () => {
      this.viewModel.selectDeck(deck.name);
      this.render();
    });

    // Make entire card clickable
    card.addEventListener('click', (evt: MouseEvent) => {
      // Don't trigger if clicking the button directly
      if (evt.target === studyBtn) return;
      this.viewModel.selectDeck(deck.name);
      this.render();
    });
  }

  /**
   * Render empty state for deck list
   */
  private renderDeckListEmptyState(container: HTMLElement) {
    const emptyState = container.createDiv({ cls: 'empty-state' });
    emptyState.createEl('div', { cls: 'empty-icon', text: '📭' });
    emptyState.createEl('div', {
      cls: 'empty-title',
      text: 'No decks found',
    });
    emptyState.createEl('div', {
      cls: 'empty-message',
      text: this.deckSearchQuery
        ? 'No decks match your search. Try a different query.'
        : 'Create flashcards in your notes and run "Scan Vault for Flashcards".',
    });
  }

  // ====== CARD VIEW ======

  /**
   * Render the card view for browsing a single deck
   */
  private renderCardView(container: HTMLElement) {
    const cardViewContainer = container.createDiv({ cls: 'card-view' });

    // Header with breadcrumb
    this.renderCardViewHeader(cardViewContainer);

    // Card progress
    this.renderCardProgress(cardViewContainer);

    // Card display
    this.renderCardDisplay(cardViewContainer);

    // Navigation buttons
    this.renderCardNavigation(cardViewContainer);

    // Actions
    this.renderCardActions(cardViewContainer);
  }

  /**
   * Render card view header with back button
   */
  private renderCardViewHeader(container: HTMLElement) {
    const header = container.createDiv({ cls: 'card-view-header' });

    // Back button
    const backBtn = header.createEl('button', {
      cls: 'back-to-decks-btn',
      text: '← Back to Decks',
    });
    backBtn.addEventListener('click', () => {
      this.viewModel.backToDeckList();
      this.render();
    });

    // Deck name
    const state = this.viewModel.getViewState();
    header.createDiv({
      cls: 'deck-title',
      text: state.selectedDeck ?? '',
    });

    // Refresh button
    const refreshBtn = header.createEl('button', {
      cls: 'card-refresh-btn',
      text: '🔄',
      attr: { 'aria-label': 'Refresh' },
    });
    refreshBtn.addEventListener('click', () => {
      this.refreshCards();
      new Notice('Refreshed cards');
    });
  }

  /**
   * Render card progress indicator
   */
  private renderCardProgress(container: HTMLElement) {
    const progress = container.createDiv({ cls: 'card-progress' });

    const state = this.viewModel.getViewState();
    const deckCards = this.viewModel.getCardsInSelectedDeck();

    progress.createDiv({
      cls: 'card-counter',
      text: `Card ${state.currentCardIndex + 1} of ${deckCards.length}`,
    });

    // Count due cards in this deck
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const dueCount = deckCards.filter(
      (c) => c.fsrsCard.due.getTime() <= endOfToday.getTime()
    ).length;

    progress.createDiv({
      cls: 'cards-due',
      text: `${dueCount} card${dueCount !== 1 ? 's' : ''} due today`,
    });
  }

  /**
   * Render the card display (front or back)
   */
  private renderCardDisplay(container: HTMLElement) {
    const display = container.createDiv({ cls: 'card-display' });
    const card = this.viewModel.getCurrentCard();

    if (!card) {
      display.createDiv({
        cls: 'empty-state',
        text: 'No cards in this deck',
      });
      return;
    }

    const state = this.viewModel.getViewState();
    
    // Card container with flip animation
    const cardContainer = display.createDiv({ cls: 'card-container' });
    const cardInner = cardContainer.createDiv({ cls: 'card-inner' });
    
    // Add flipped class if showing answer
    if (state.showingAnswer) {
      cardInner.addClass('flipped');
    }

    // Front of card (question)
    const cardFront = cardInner.createDiv({ cls: 'card-face card-front' });
    cardFront.createDiv({
      cls: 'card-text',
      text: card.front,
    });
    const frontBtn = cardFront.createEl('button', {
      cls: 'flip-btn',
      text: 'Show Answer',
    });
    frontBtn.addEventListener('click', () => {
      this.viewModel.flipCard();
      this.render();
    });

    // Back of card (answer)
    const cardBack = cardInner.createDiv({ cls: 'card-face card-back' });
    cardBack.createDiv({
      cls: 'card-text',
      text: card.back,
    });
    const backBtn = cardBack.createEl('button', {
      cls: 'flip-btn',
      text: 'Show Question',
    });
    backBtn.addEventListener('click', () => {
      this.viewModel.flipCard();
      this.render();
    });
  }

  /**
   * Render card navigation buttons
   */
  private renderCardNavigation(container: HTMLElement) {
    const nav = container.createDiv({ cls: 'card-navigation' });

    const state = this.viewModel.getViewState();
    const deckCards = this.viewModel.getCardsInSelectedDeck();

    // Previous button
    const prevBtn = nav.createEl('button', {
      cls: 'nav-btn prev-btn',
      text: '← Previous',
    });
    prevBtn.disabled = state.currentCardIndex === 0;
    prevBtn.addEventListener('click', () => {
      this.viewModel.goToPreviousCard();
      this.render();
    });

    // Next button
    const nextBtn = nav.createEl('button', {
      cls: 'nav-btn next-btn',
      text: 'Next →',
    });
    nextBtn.disabled = state.currentCardIndex >= deckCards.length - 1;
    nextBtn.addEventListener('click', () => {
      this.viewModel.goToNextCard();
      this.render();
    });
  }

  /**
   * Render card action buttons
   */
  private renderCardActions(container: HTMLElement) {
    const actions = container.createDiv({ cls: 'card-actions' });
    const card = this.viewModel.getCurrentCard();

    if (!card) return;

    // Open note button
    const openBtn = actions.createEl('button', {
      cls: 'action-btn open-btn',
      text: 'Open Note',
    });
    openBtn.addEventListener('click', () => this.openCardNote(card));

    // Delete button
    const deleteBtn = actions.createEl('button', {
      cls: 'action-btn delete-btn',
      text: 'Delete',
    });
    deleteBtn.addEventListener('click', () => this.deleteCard(card));
  }

  // ====== HELPER METHODS ======

  /**
   * Open card's source note at the card location
   */
  private async openCardNote(card: FlashlyCard) {
    // Ensure workspace is ready before opening file
    if (!this.app.workspace.layoutReady) {
      await new Promise(resolve => {
        this.app.workspace.onLayoutReady(() => resolve(null));
      });
    }

    let file = this.app.vault.getAbstractFileByPath(card.source.file);
    // Retry logic: try up to 3 times with small delay if file not found
    let attempts = 0;
    while (!file && attempts < 3) {
      await new Promise(res => setTimeout(res, 200));
      file = this.app.vault.getAbstractFileByPath(card.source.file);
      attempts++;
    }

    if (!file) {
      console.error('Flashly: File not found in vault:', card.source.file);
      new Notice(`Could not find file: ${card.source.file}\n\nThe file may have been moved, renamed, or deleted.\nIf you recently changed your vault structure, try rescanning for flashcards.`);
      return;
    }
    if (!(file instanceof TFile)) {
      console.error('Flashly: Path is not a file:', card.source.file, 'Type:', file.constructor.name);
      new Notice(`Path is a folder, not a file: ${card.source.file}`);
      return;
    }

    const leaf = this.app.workspace.getLeaf(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await leaf.openFile(file);

    // Navigate to line
    const view = this.app.workspace.getActiveViewOfType(ItemView);
    if (view && 'editor' in view) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editor = (view as any).editor;
      if (editor) {
        editor.setCursor({ line: card.source.line - 1, ch: 0 });
        editor.scrollIntoView({ from: { line: card.source.line - 1, ch: 0 }, to: { line: card.source.line - 1, ch: 0 } });
      }
    }
  }

  /**
   * Delete a card with confirmation
   */
  private async deleteCard(card: FlashlyCard) {
    const confirmed = confirm(`Delete flashcard:\n\n${card.front}\n\nThis cannot be undone.`);
    if (!confirmed) return;

    this.plugin.storage.deleteCard(card.id);
    await this.plugin.storage.save();

    new Notice('Card deleted');
    this.refreshCards();
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyPress(evt: KeyboardEvent) {
    const state = this.viewModel.getViewState();

    // Handle keyboard shortcuts based on current mode
    if (state.mode === BrowserViewMode.DECK_LIST) {
      this.handleDeckListKeyPress(evt);
    } else {
      this.handleCardViewKeyPress(evt);
    }
  }

  /**
   * Handle keyboard shortcuts in deck list mode
   */
  private handleDeckListKeyPress(evt: KeyboardEvent) {
    switch (evt.key) {
      case '/': {
        evt.preventDefault();
        const searchInput = this.containerEl.querySelector('.deck-search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        break;
      }
      case 'Escape': {
        const focusedInput = this.containerEl.querySelector('.deck-search-input:focus');
        if (focusedInput) {
          (focusedInput as HTMLInputElement).blur();
          this.containerEl.focus();
        }
        break;
      }
    }
  }

  /**
   * Handle keyboard shortcuts in card view mode
   */
  private handleCardViewKeyPress(evt: KeyboardEvent) {
    const deckCards = this.viewModel.getCardsInSelectedDeck();
    const state = this.viewModel.getViewState();

    switch (evt.key) {
      case 'ArrowRight':
      case 'n':
        evt.preventDefault();
        if (state.currentCardIndex < deckCards.length - 1) {
          this.viewModel.goToNextCard();
          this.render();
        }
        break;

      case 'ArrowLeft':
      case 'p':
        evt.preventDefault();
        if (state.currentCardIndex > 0) {
          this.viewModel.goToPreviousCard();
          this.render();
        }
        break;

      case ' ':
      case 'f':
        evt.preventDefault();
        this.viewModel.flipCard();
        this.render();
        break;

      case 'Escape':
        evt.preventDefault();
        this.viewModel.backToDeckList();
        this.render();
        break;

      case 'Enter': {
        evt.preventDefault();
        const card = this.viewModel.getCurrentCard();
        if (card) {
          this.openCardNote(card);
        }
        break;
      }

      case 'Delete':
      case 'Backspace': {
        evt.preventDefault();
        const currentCard = this.viewModel.getCurrentCard();
        if (currentCard) {
          this.deleteCard(currentCard);
        }
        break;
      }
    }
  }
}
