import { readFileSync, writeFileSync } from 'fs';

const file = './src/ui/settings-tab.ts';
let content = readFileSync(file, 'utf-8');

// COMPLETE list of remaining fixes for settings-tab.ts
const fixes = [
	// Headers and toggles
	[".setName('Inline flashcards')", ".setName('inline flashcards')"],
	[".setHeading();", ".setHeading();"], // No change needed for this
	[".setName('Enable inline flashcards')", ".setName('enable inline flashcards')"],
	[".setDesc('Parse Q::A format", ".setDesc('parse Q::A format"],
	[".setName('Header-based flashcards')", ".setName('header-based flashcards')"],
	[".setName('Enable header-based flashcards')", ".setName('enable header-based flashcards')"],
	[".setDesc('Convert headers in tagged notes to flashcards')", ".setDesc('convert headers in tagged notes to flashcards')"],
	[".setName('Header levels')", ".setName('header levels')"],
	[".setDesc('Which header levels to convert", ".setDesc('which header levels to convert"],
	[".setName('Deck name priority')", ".setName('deck name priority')"],
	[".setDesc('Order to determine deck name", ".setDesc('order to determine deck name"],
	[".addOption('frontmatter,title,subtags', 'Frontmatter →", ".addOption('frontmatter,title,subtags', 'frontmatter →"],
	[".addOption('title,frontmatter,subtags', 'Title →", ".addOption('title,frontmatter,subtags', 'title →"],
	[".addOption('frontmatter,subtags,title', 'Frontmatter →", ".addOption('frontmatter,subtags,title', 'frontmatter →"],
	[".setName('Use subtags for deck names')", ".setName('use subtags for deck names')"],
	[".setDesc('Use #flashcards/math as deck name')", ".setDesc('use #flashcards/math as deck name')"],
	[".setName('Answer terminator')", ".setName('answer terminator')"],
	[".setDesc('How to determine where answer ends')", ".setDesc('how to determine where answer ends')"],
	[".addOption('next-header', 'Next header')", ".addOption('next-header', 'next header')"],
	[".addOption('blank-line', 'Blank line')", ".addOption('blank-line', 'blank line')"],
	[".addOption('hr', 'Horizontal rule')", ".addOption('hr', 'horizontal rule')"],
	[".setName('Enable exclusion comments')", ".setName('enable exclusion comments')"],
	[".setDesc('Allow %%NO_FLASHCARD%% to skip headers')", ".setDesc('allow %%NO_FLASHCARD%% to skip headers')"],
	[".setName('Exclusion comment')", ".setName('exclusion comment')"],
	[".setDesc('Comment text to exclude headers')", ".setDesc('comment text to exclude headers')"],
	[".setName('Advanced')", ".setName('advanced')"],
	[".setName('Review sessions')", ".setName('review sessions')"],
	[".setName('Scheduler algorithm')", ".setName('scheduler algorithm')"],
	[".setName('Daily due limit')", ".setName('daily due limit')"],
	[".setDesc('Maximum number of due cards per review session')", ".setDesc('maximum number of due cards per review session')"],
	[".setName('Daily new limit')", ".setName('daily new limit')"],
	[".setDesc('Maximum number of new cards introduced per session')", ".setDesc('maximum number of new cards introduced per session')"],
	[".setName('Include learning cards')", ".setName('include learning cards')"],
	[".setDesc('Keep cards in learning steps within the queue')", ".setDesc('keep cards in learning steps within the queue')"],
	[".setName('Ignore empty answers')", ".setName('ignore empty answers')"],
	[".setDesc('Skip cards without answers until filled in')", ".setDesc('skip cards without answers until filled in')"],
	[".setName('Deck filter')", ".setName('deck filter')"],
	[".setDesc('Only review specific decks", ".setDesc('only review specific decks"],
	[".setName('Keyboard shortcuts')", ".setName('keyboard shortcuts')"],
	[".setDesc('Enable keyboard controls", ".setDesc('enable keyboard controls"],
	[".setName('Quiz generation (AI-powered)')", ".setName('quiz generation (AI-powered)')"],
	[".setName('Enable AI quiz generation')", ".setName('enable AI quiz generation')"],
	[".setDesc('Use AI to generate quiz questions from your flashcards')", ".setDesc('use AI to generate quiz questions from your flashcards')"],
	[".setName('AI provider')", ".setName('AI provider')"], // Keep AI caps
	[".setName('OpenAI configuration')", ".setName('openAI configuration')"],
	[".setName('API key')", ".setName('API key')"], // Keep API caps
	[".setName('Model')", ".setName('model')"],
	[".setName('Anthropic configuration')", ".setName('anthropic configuration')"],
	[".setName('Google Gemini configuration')", ".setName('google Gemini configuration')"],
	[".setName('Custom API configuration')", ".setName('custom API configuration')"],
	[".setName('Base URL')", ".setName('base URL')"],
	[".setDesc('API endpoint URL')", ".setDesc('API endpoint URL')"], // Keep API caps
	[".setName('Model name')", ".setName('model name')"],
	[".setName('Endpoint path (optional)')", ".setName('endpoint path (optional)')"],
	[".setDesc('API endpoint path", ".setDesc('API endpoint path"], // Keep API caps
	[".setName('Temperature')", ".setName('temperature')"],
	[".setDesc('Creativity level", ".setDesc('creativity level"],
	[".setName('Max tokens')", ".setName('max tokens')"],
	[".setDesc('Maximum response length')", ".setDesc('maximum response length')"],
	[".setName('System prompt')", ".setName('system prompt')"],
	[".setDesc('Custom instructions for the AI", ".setDesc('custom instructions for the AI"],
	[".setName('Replay tutorial')", ".setName('replay tutorial')"],
	[".setDesc('Show the first-time user tutorial again')", ".setDesc('show the first-time user tutorial again')"],
	[".setName('Developer')", ".setName('developer')"],
	[".setName('Enable debug logging')", ".setName('enable debug logging')"],
	[".setDesc('Show detailed debug logs in the console", ".setDesc('show detailed debug logs in the console"],
];

let fixCount = 0;
for (const [oldStr, newStr] of fixes) {
	const before = content;
	content = content.split(oldStr).join(newStr);
	if (content !== before) {
		fixCount++;
	}
}

writeFileSync(file, content, 'utf-8');
console.log(`✅ Applied ${fixCount} fixes to settings-tab.ts`);
