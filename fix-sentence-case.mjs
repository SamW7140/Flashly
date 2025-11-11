import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/ui/settings-tab.ts';
let content = readFileSync(filePath, 'utf-8');

// List of all replacements needed to fix sentence case
const replacements = [
	// Headings
	['.setName(\'Advanced\')', '.setName(\'advanced\')'],
	['.setName(\'Review sessions\')', '.setName(\'review sessions\')'],
	['.setName(\'Daily due limit\')', '.setName(\'daily due limit\')'],
	['.setName(\'Daily new limit\')', '.setName(\'daily new limit\')'],
	['.setName(\'Include learning cards\')', '.setName(\'include learning cards\')'],
	['.setName(\'Ignore empty answers\')', '.setName(\'ignore empty answers\')'],
	['.setName(\'Enable AI quiz generation\')', '.setName(\'enable AI quiz generation\')'],
	['.setName(\'OpenAI configuration\')', '.setName(\'openAI configuration\')'],
	['.setName(\'Anthropic configuration\')', '.setName(\'anthropic configuration\')'],
	['.setName(\'Google Gemini configuration\')', '.setName(\'google Gemini configuration\')'],
	['.setName(\'Custom API configuration\')', '.setName(\'custom API configuration\')'],
	['.setName(\'General\')', '.setName(\'general\')'],
	['.setName(\'Export\')', '.setName(\'export\')'],
	['.setName(\'Tutorial\')', '.setName(\'tutorial\')'],
	
	// Descriptions
	['.setDesc(\'Maximum number of due cards per review session\')', '.setDesc(\'maximum number of due cards per review session\')'],
	['.setDesc(\'Maximum number of new cards introduced per session\')', '.setDesc(\'maximum number of new cards introduced per session\')'],
	['.setDesc(\'Keep cards in learning steps within the queue\')', '.setDesc(\'keep cards in learning steps within the queue\')'],
	['.setDesc(\'Skip cards without answers until filled in\')', '.setDesc(\'skip cards without answers until filled in\')'],
	['.setDesc(\'Use AI to generate quiz questions from your flashcards\')', '.setDesc(\'use AI to generate quiz questions from your flashcards\')'],
	
	// Dropdown options
	['.addOption(\'openai\', \'OpenAI (GPT-4, GPT-3.5)\')', '.addOption(\'openai\', \'openAI (GPT-4, GPT-3.5)\')'],
	['.addOption(\'anthropic\', \'Anthropic (Claude)\')', '.addOption(\'anthropic\', \'anthropic (Claude)\')'],
	['.addOption(\'gemini\', \'Google Gemini\')', '.addOption(\'gemini\', \'google Gemini\')'],
	['.addOption(\'custom\', \'Custom API endpoint\')', '.addOption(\'custom\', \'custom API endpoint\')'],
	['.addOption(\'gpt-4\', \'GPT-4 (most capable)\')', '.addOption(\'gpt-4\', \'GPT-4 (most capable)\')'],
	['.addOption(\'gpt-4-turbo\', \'GPT-4 turbo (faster)\')', '.addOption(\'gpt-4-turbo\', \'GPT-4 turbo (faster)\')'],
	['.addOption(\'gpt-3.5-turbo\', \'GPT-3.5 turbo (cheaper)\')', '.addOption(\'gpt-3.5-turbo\', \'GPT-3.5 turbo (cheaper)\')'],
	['.addOption(\'claude-3-5-sonnet-20241022\', \'Claude 3.5 Sonnet\')', '.addOption(\'claude-3-5-sonnet-20241022\', \'Claude 3.5 sonnet\')'],
	['.addOption(\'claude-3-opus-20240229\', \'Claude 3 Opus\')', '.addOption(\'claude-3-opus-20240229\', \'Claude 3 opus\')'],
	['.addOption(\'claude-3-sonnet-20240229\', \'Claude 3 Sonnet\')', '.addOption(\'claude-3-sonnet-20240229\', \'Claude 3 sonnet\')'],
	['.addOption(\'claude-3-haiku-20240307\', \'Claude 3 Haiku\')', '.addOption(\'claude-3-haiku-20240307\', \'Claude 3 haiku\')'],
	['.addOption(\'gemini-2.5-pro\', \'Gemini 2.5 Pro (most capable, reasoning)\')', '.addOption(\'gemini-2.5-pro\', \'Gemini 2.5 pro (most capable, reasoning)\')'],
	['.addOption(\'gemini-2.5-flash\', \'Gemini 2.5 Flash (fast, best price/performance)\')', '.addOption(\'gemini-2.5-flash\', \'Gemini 2.5 flash (fast, best price/performance)\')'],
	['.addOption(\'gemini-2.0-flash\', \'Gemini 2.0 Flash\')', '.addOption(\'gemini-2.0-flash\', \'Gemini 2.0 flash\')'],
	['.addOption(\'gemini-1.5-pro\', \'Gemini 1.5 Pro (legacy)\')', '.addOption(\'gemini-1.5-pro\', \'Gemini 1.5 pro (legacy)\')'],
	['.addOption(\'gemini-1.5-flash\', \'Gemini 1.5 flash (legacy)\')', '.addOption(\'gemini-1.5-flash\', \'Gemini 1.5 flash (legacy)\')'],
	
	// More settings
	['.setDesc(\'your OpenAI API key\')', '.setDesc(\'your openAI API key\')'],
	['.setDesc(\'openAI model to use\')', '.setDesc(\'openAI model to use\')'],
	['.setDesc(\'your Anthropic API key\')', '.setDesc(\'your anthropic API key\')'],
	['.setDesc(\'anthropic model to use\')', '.setDesc(\'anthropic model to use\')'],
	['.setDesc(\'your Google AI Studio API key\')', '.setDesc(\'your google AI Studio API key\')'],
	['.setDesc(\'gemini model to use\')', '.setDesc(\'gemini model to use\')'],
	['.setDesc(\'Custom OpenAI-compatible endpoint URL\')', '.setDesc(\'custom openAI-compatible endpoint URL\')'],
	
	// Quiz generation description
	['.setName(\'Quiz generation (AI-powered)\')', '.setName(\'quiz generation (AI-powered)\')'],
];

// Apply all replacements
for (const [oldStr, newStr] of replacements) {
	content = content.replace(oldStr, newStr);
}

// Write back
writeFileSync(filePath, content, 'utf-8');
console.log('Fixed sentence case issues in settings-tab.ts');
