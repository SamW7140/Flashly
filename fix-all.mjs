import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/ui/settings-tab.ts';
let content = readFileSync(filePath, 'utf-8');

// All replacements needed
const fixes = [
	// Settings names
	[".setName('Enable ?? format')", ".setName('enable ?? format')"],
	[".setName('Enable {cloze} format')", ".setName('enable {cloze} format')"],
	[".setName('Header levels')", ".setName('header levels')"],
	[".setName('Review sessions')", ".setName('review sessions')"],
	[".setName('Scheduler algorithm')", ".setName('scheduler algorithm')"],
	[".setName('Keyboard shortcuts')", ".setName('keyboard shortcuts')"],
	[".setName('OpenAI configuration')", ".setName('openAI configuration')"],
	[".setName('Anthropic configuration')", ".setName('anthropic configuration')"],
	[".setName('Google Gemini configuration')", ".setName('google Gemini configuration')"],
	
	// Descriptions
	[".setDesc('Multi-line question/answer format')", ".setDesc('multi-line question/answer format')"],
	[".setDesc('Cloze deletion format')", ".setDesc('cloze deletion format')"],
	[".setDesc('Which header levels to convert (2-6, comma-separated)')", ".setDesc('which header levels to convert (2-6, comma-separated)')"],
	[".setDesc('Enable keyboard controls (space, 1-4, Esc) in review sessions')", ".setDesc('enable keyboard controls (space, 1-4, Esc) in review sessions')"],
	[".setDesc('OpenAI model to use')", ".setDesc('openAI model to use')"],
	[".setDesc('Your Anthropic API key')", ".setDesc('your anthropic API key')"],
	[".setDesc('Your Google AI Studio API key')", ".setDesc('your google AI Studio API key')"],
	
	// Dropdown options - only change first letter after quote
	["'OpenAI (GPT-4, GPT-3.5)'", "'openAI (GPT-4, GPT-3.5)'"],
	["'Anthropic (Claude)'", "'anthropic (Claude)'"],
	["'Google Gemini'", "'google Gemini'"],
	["'Custom API endpoint'", "'custom API endpoint'"],
	
	// More placeholders and descriptions  
	[".setDesc('Only review specific decks", ".setDesc('only review specific decks"],
];

let changeCount = 0;
for (const [oldStr, newStr] of fixes) {
	const before = content;
	content = content.split(oldStr).join(newStr);
	if (content !== before) {
		changeCount++;
		console.log(`✓ Fixed: ${oldStr.substring(0, 40)}...`);
	}
}

writeFileSync(filePath, content, 'utf-8');
console.log(`\n✅ Applied ${changeCount} fixes`);
