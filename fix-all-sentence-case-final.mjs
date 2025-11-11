import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Function to lowercase first letter unless it's a proper noun
function lowercaseFirst(text) {
	// List of proper nouns and acronyms that should stay capitalized
	const properNouns = ['FSRS', 'SM-2', 'GPT-4', 'GPT-3.5', 'API', 'OpenAI', 'Claude', 'Gemini', 'Anthropic', 'Google', 'AI', 'PoC', 'Esc', 'Markdown', 'JSON'];
	
	// Don't lowercase if starts with a proper noun
	for (const noun of properNouns) {
		if (text.startsWith(noun)) return text;
	}
	
	// Lowercase first character
	return text.charAt(0).toLowerCase() + text.slice(1);
}

// Files to process
const files = [
	'./src/commands/scan-poc.ts',
	'./src/ui/export-modal.ts',
	'./src/ui/quiz-history-view.ts',
	'./src/ui/quiz-view.ts',
	'./src/ui/settings-tab.ts'
];

let totalFixes = 0;

for (const file of files) {
	console.log(`\n Processing ${file}...`);
	let content = readFileSync(file, 'utf-8');
	let fixes = 0;
	
	// Fix .setName() calls
	content = content.replace(/\.setName\('([^']+)'\)/g, (match, name) => {
		if (name.charAt(0) === name.charAt(0).toUpperCase() && name.charAt(0) !== name.charAt(0).toLowerCase()) {
			const fixed = lowercaseFirst(name);
			if (fixed !== name) {
				fixes++;
				return `.setName('${fixed}')`;
			}
		}
		return match;
	});
	
	// Fix .setDesc() calls
	content = content.replace(/\.setDesc\('([^']+)'\)/g, (match, desc) => {
		if (desc.charAt(0) === desc.charAt(0).toUpperCase() && desc.charAt(0) !== desc.charAt(0).toLowerCase()) {
			const fixed = lowercaseFirst(desc);
			if (fixed !== desc) {
				fixes++;
				return `.setDesc('${fixed}')`;
			}
		}
		return match;
	});
	
	// Fix .addOption() display text (second parameter)
	content = content.replace(/\.addOption\('([^']+)',\s*'([^']+)'\)/g, (match, value, display) => {
		if (display.charAt(0) === display.charAt(0).toUpperCase() && display.charAt(0) !== display.charAt(0).toLowerCase()) {
			const fixed = lowercaseFirst(display);
			if (fixed !== display) {
				fixes++;
				return `.addOption('${value}', '${fixed}')`;
			}
		}
		return match;
	});
	
	// Fix .createEl() text parameter
	content = content.replace(/\.createEl\('([^']+)',\s*\{\s*text:\s*'([^']+)'/g, (match, tag, text) => {
		if (text.charAt(0) === text.charAt(0).toUpperCase() && text.charAt(0) !== text.charAt(0).toLowerCase()) {
			const fixed = lowercaseFirst(text);
			if (fixed !== text) {
				fixes++;
				return `.createEl('${tag}', { text: '${fixed}'`;
			}
		}
		return match;
	});
	
	// Fix .setPlaceholder() calls
	content = content.replace(/\.setPlaceholder\('([^']+)'\)/g, (match, placeholder) => {
		if (placeholder.charAt(0) === placeholder.charAt(0).toUpperCase() && placeholder.charAt(0) !== placeholder.charAt(0).toLowerCase()) {
			const fixed = lowercaseFirst(placeholder);
			if (fixed !== placeholder) {
				fixes++;
				return `.setPlaceholder('${fixed}')`;
			}
		}
		return match;
	});
	
	// Fix new Notice() messages
	content = content.replace(/new Notice\('([^']+)'\)/g, (match, msg) => {
		if (msg.charAt(0) === msg.charAt(0).toUpperCase() && msg.charAt(0) !== msg.charAt(0).toLowerCase()) {
			const fixed = lowercaseFirst(msg);
			if (fixed !== msg) {
				fixes++;
				return `new Notice('${fixed}')`;
			}
		}
		return match;
	});
	
	// Fix createEl strong text
	content = content.replace(/createEl\('strong',\s*\{\s*text:\s*'([^']+)'/g, (match, text) => {
		if (text.charAt(0) === text.charAt(0).toUpperCase() && text.charAt(0) !== text.charAt(0).toLowerCase()) {
			const fixed = lowercaseFirst(text);
			if (fixed !== text) {
				fixes++;
				return `createEl('strong', { text: '${fixed}'`;
			}
		}
		return match;
	});
	
	writeFileSync(file, content, 'utf-8');
	console.log(`  ✓ Applied ${fixes} fixes`);
	totalFixes += fixes;
}

console.log(`\n✅ Total fixes applied: ${totalFixes}`);
console.log('\nRunning ESLint to verify...\n');

try {
	execSync('node .\\eslint-plugin\\node_modules\\eslint\\bin\\eslint.js --config obsidian-eslint.config.mjs src main.ts', { encoding: 'utf-8', stdio: 'inherit' });
	console.log('\n✅ All sentence case errors fixed!');
} catch (e) {
	console.log('\n⚠️  Some errors may remain - check output above');
}
