import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/ui/settings-tab.ts';
let content = readFileSync(filePath, 'utf-8');

// Function to convert first letter to lowercase (except for proper nouns/acronyms)
function sentenceCase(text) {
	// List of exceptions that should stay capitalized
	const exceptions = ['FSRS', 'SM-2', 'GPT-4', 'GPT-3.5', 'API', 'OpenAI', 'Claude', 'Gemini', 'Anthropic', 'Google', 'AI', 'PoC'];
	
	// Check if text starts with an exception
	for (const exc of exceptions) {
		if (text.startsWith(exc)) {
			// Make first letter lowercase, keep exception
			return text.charAt(0).toLowerCase() + text.slice(1);
		}
	}
	
	// Otherwise just lowercase first letter
	return text.charAt(0).toLowerCase() + text.slice(1);
}

// Fix .setName() calls
content = content.replace(/\.setName\('([^']+)'\)/g, (match, name) => {
	if (name.charAt(0) === name.charAt(0).toUpperCase() && name.charAt(0) !== name.charAt(0).toLowerCase()) {
		const fixed = sentenceCase(name);
		console.log(`Fixed setName: "${name}" => "${fixed}"`);
		return `.setName('${fixed}')`;
	}
	return match;
});

// Fix .setDesc() calls
content = content.replace(/\.setDesc\('([^']+)'\)/g, (match, desc) => {
	if (desc.charAt(0) === desc.charAt(0).toUpperCase() && desc.charAt(0) !== desc.charAt(0).toLowerCase()) {
		const fixed = sentenceCase(desc);
		console.log(`Fixed setDesc: "${desc}" => "${fixed}"`);
		return `.setDesc('${fixed}')`;
	}
	return match;
});

// Fix .addOption() calls (second parameter only - the display text)
content = content.replace(/\.addOption\('([^']+)',\s*'([^']+)'\)/g, (match, value, display) => {
	if (display.charAt(0) === display.charAt(0).toUpperCase() && display.charAt(0) !== display.charAt(0).toLowerCase()) {
		const fixed = sentenceCase(display);
		console.log(`Fixed addOption: "${display}" => "${fixed}"`);
		return `.addOption('${value}', '${fixed}')`;
	}
	return match;
});

// Fix .createEl() text parameter
content = content.replace(/\.createEl\('([^']+)',\s*\{\s*text:\s*'([^']+)'/g, (match, tag, text) => {
	if (text.charAt(0) === text.charAt(0).toUpperCase() && text.charAt(0) !== text.charAt(0).toLowerCase()) {
		const fixed = sentenceCase(text);
		console.log(`Fixed createEl text: "${text}" => "${fixed}"`);
		return `.createEl('${tag}', { text: '${fixed}'`;
	}
	return match;
});

// Fix .setPlaceholder() calls
content = content.replace(/\.setPlaceholder\('([^']+)'\)/g, (match, placeholder) => {
	if (placeholder.charAt(0) === placeholder.charAt(0).toUpperCase() && placeholder.charAt(0) !== placeholder.charAt(0).toLowerCase()) {
		const fixed = sentenceCase(placeholder);
		console.log(`Fixed setPlaceholder: "${placeholder}" => "${fixed}"`);
		return `.setPlaceholder('${fixed}')`;
	}
	return match;
});

// Write back
writeFileSync(filePath, content, 'utf-8');
console.log('\nCompleted sentence case fixes in settings-tab.ts');
