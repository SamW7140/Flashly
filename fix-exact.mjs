import { readFileSync, writeFileSync } from 'fs';

const files = {
	'./src/commands/scan-poc.ts': [
		["name: 'Scan active note (phase 0 PoC)'", "name: 'scan active note (phase 0 PoC)'"],
		["new Notice('Please open a Markdown note first')", "new Notice('please open a Markdown note first')"],
		["new Notice('No active file')", "new Notice('no active file')"],
		["new Notice('No flashcards found", "new Notice('no flashcards found"],
	],
	'./src/ui/export-modal.ts': [
		["contentEl.createEl('h3', { text: 'Export options' })", "contentEl.createEl('h3', { text: 'export options' })"],
		[".setName('Include tags')", ".setName('include tags')"],
		[".setDesc('Include card tags in export')", ".setDesc('include card tags in export')"],
		[".setName('Include scheduling data')", ".setName('include scheduling data')"],
		[".setDesc('Include FSRS scheduling information", ".setDesc('include FSRS scheduling information"],
		[".setName('Include media')", ".setName('include media')"],
		[".setDesc('Include images and audio", ".setDesc('include images and audio"],
		["text: 'Preview'", "text: 'preview'"],
		["text: 'Export'", "text: 'export'"],
		["text: 'Cancel'", "text: 'cancel'"],
		["`Preview:", "`preview:"],
		["new Notice('Please select at least one deck to export')", "new Notice('please select at least one deck to export')"],
		["new Notice('Starting export...')", "new Notice('starting export...')"],
		["new Notice(`✅ Exported", "new Notice(`✅ exported"],
		["new Notice(`❌ Export failed", "new Notice(`❌ export failed"],
	],
	'./src/ui/quiz-history-view.ts': [
		["text: 'Export quiz'", "text: 'export quiz'"],
		["text: 'Choose where", "text: 'choose where"],
		["placeholder: 'File path", "placeholder: 'file path"],
	],
	'./src/ui/quiz-view.ts': [
		["text: 'Use the \"Generate quiz\" command", "text: 'use the \"generate quiz\" command"],
		["text: 'Shortcuts: '", "text: 'shortcuts: '"],
		["text: 'Your answer: '", "text: 'your answer: '"],
		["text: 'Correct answer: '", "text: 'correct answer: '"],
		["text: 'Explanation:'", "text: 'explanation:'"],
		["text: 'This question will appear again later.'", "text: 'this question will appear again later.'"],
	],
	'./src/ui/settings-tab.ts': [
		[".setName('Enable Q::A format')", ".setName('enable Q::A format')"],
		[".setDesc('Single-line question::answer format')", ".setDesc('single-line question::answer format')"],
		[".setName('Enable ?? format')", ".setName('enable ?? format')"],
		[".setDesc('Multi-line question/answer format')", ".setDesc('multi-line question/answer format')"],
		[".setName('Enable {cloze} format')", ".setName('enable {cloze} format')"],
		[".setDesc('Cloze deletion format')", ".setDesc('cloze deletion format')"],
		[".setName('Create empty cards')", ".setName('create empty cards')"],
		[".setDesc('Create flashcards even when answer is empty')", ".setDesc('create flashcards even when answer is empty')"],
		[".setName('Flashcard tags')", ".setName('flashcard tags')"],
		[".setDesc('Tags that mark notes for header parsing", ".setDesc('tags that mark notes for header parsing"],
		[".setPlaceholder('Flashcards, cards')", ".setPlaceholder('flashcards, cards')"],
		[".setName('Allow mixed formats')", ".setName('allow mixed formats')"],
		[".setDesc('Allow both inline and header flashcards", ".setDesc('allow both inline and header flashcards"],
		[".setDesc('Choose between FSRS", ".setDesc('choose between FSRS"],
		[".setDesc('Choose your AI provider", ".setDesc('choose your AI provider"],
		[".setPlaceholder('Biology, chemistry')", ".setPlaceholder('biology, chemistry')"],
		[".addOption('openai', 'OpenAI (GPT-4", ".addOption('openai', 'openAI (GPT-4"],
		[".addOption('anthropic', 'Anthropic (Claude')", ".addOption('anthropic', 'anthropic (Claude)')"],
		[".addOption('gemini', 'Google Gemini')", ".addOption('gemini', 'google Gemini')"],
		[".addOption('custom', 'Custom API endpoint')", ".addOption('custom', 'custom API endpoint')"],
		[".setDesc('Your OpenAI API key')", ".setDesc('your openAI API key')"],
		[".setDesc('OpenAI model to use')", ".setDesc('openAI model to use')"],
		[".addOption('gpt-4-turbo', 'GPT-4 Turbo", ".addOption('gpt-4-turbo', 'GPT-4 turbo"],
		[".addOption('gpt-3.5-turbo', 'GPT-3.5 Turbo", ".addOption('gpt-3.5-turbo', 'GPT-3.5 turbo"],
		[".setDesc('Your Anthropic API key')", ".setDesc('your anthropic API key')"],
		[".setDesc('Anthropic model to use')", ".setDesc('anthropic model to use')"],
		["'Claude 3.5 Sonnet'", "'Claude 3.5 sonnet'"],
		["'Claude 3 Opus'", "'Claude 3 opus'"],
		["'Claude 3 Sonnet'", "'Claude 3 sonnet'"],
		["'Claude 3 Haiku'", "'Claude 3 haiku'"],
		[".setDesc('Your Google AI Studio API key')", ".setDesc('your google AI Studio API key')"],
		[".setDesc('Gemini model to use')", ".setDesc('gemini model to use')"],
		["'Gemini 2.5 Pro (most capable, reasoning)'", "'Gemini 2.5 pro (most capable, reasoning)'"],
		["'Gemini 2.5 Flash (fast, best price/performance)'", "'Gemini 2.5 flash (fast, best price/performance)'"],
		["'Gemini 2.0 Flash'", "'Gemini 2.0 flash'"],
		["'Gemini 1.5 Pro (legacy)'", "'Gemini 1.5 pro (legacy)'"],
		["'Gemini 1.5 Flash (legacy)'", "'Gemini 1.5 flash (legacy)'"],
		[".setPlaceholder('Enter API key')", ".setPlaceholder('enter API key')"],
		[".setPlaceholder('Model name')", ".setPlaceholder('model-name')"],
		[".setDesc('Model identifier')", ".setDesc('model identifier')"],
	]
};

let totalFixes = 0;

for (const [file, replacements] of Object.entries(files)) {
	console.log(`\nProcessing ${file}...`);
	let content = readFileSync(file, 'utf-8');
	let fixes = 0;
	
	for (const [oldStr, newStr] of replacements) {
		if (content.includes(oldStr)) {
			content = content.replace(oldStr, newStr);
			fixes++;
		}
	}
	
	writeFileSync(file, content, 'utf-8');
	console.log(`  ✓ Applied ${fixes} fixes`);
	totalFixes += fixes;
}

console.log(`\n✅ Total fixes applied: ${totalFixes}`);
