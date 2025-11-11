import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/ui/settings-tab.ts';
let content = readFileSync(filePath, 'utf-8');

// Apply all replacements
const replacements = [
	// Simple case-sensitive replacements
	[".setDesc('Gemini model to use')", ".setDesc('gemini model to use')"],
	[".setPlaceholder('Enter API key')", ".setPlaceholder('enter API key')"],
	[".setPlaceholder('Model name')", ".setPlaceholder('model-name')"],
	[".setPlaceholder('Biology, chemistry')", ".setPlaceholder('biology, chemistry')"],
	
	// Gemini options
	["'Gemini 2.5 Pro (most capable, reasoning)'", "'Gemini 2.5 pro (most capable, reasoning)'"],
	["'Gemini 2.5 Flash (fast, best price/performance)'", "'Gemini 2.5 flash (fast, best price/performance)'"],
	["'Gemini 2.0 Flash'", "'Gemini 2.0 flash'"],
	["'Gemini 1.5 Pro (legacy)'", "'Gemini 1.5 pro (legacy)'"],
	["'Gemini 1.5 Flash (legacy)'", "'Gemini 1.5 flash (legacy)'"],
	
	// Additional fixes
	[".setDesc('Model identifier')", ".setDesc('model identifier')"],
];

for (const [oldStr, newStr] of replacements) {
	if (content.includes(oldStr)) {
		content = content.replace(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
		console.log(`Fixed: ${oldStr} → ${newStr}`);
	}
}

writeFileSync(filePath, content, 'utf-8');
console.log('\nCompleted remaining sentence case fixes');
