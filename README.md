# Flashly - Spaced Repetition Flashcards for Obsidian# Obsidian Sample Plugin



Flashly is an Obsidian plugin that turns your notes into flashcards using spaced repetition learning powered by FSRS (Free Spaced Repetition Scheduler).This is a sample plugin for Obsidian (https://obsidian.md).



## FeaturesThis project uses TypeScript to provide type checking and documentation.

The repo depends on the latest plugin API (obsidian.d.ts) in TypeScript Definition format, which contains TSDoc comments describing what it does.

- 📝 **Multiple Flashcard Formats**

  - Q::A inline formatThis sample plugin demonstrates some of the basic functionality the plugin API can do.

  - ?? multi-line format  - Adds a ribbon icon, which shows a Notice when clicked.

  - {cloze} deletion format- Adds a command "Open Sample Modal" which opens a Modal.

  - Header-based question/answer format- Adds a plugin setting tab to the settings page.

- 🎯 **Smart Deck Organization** - Automatically organize cards by note filename or custom deck names- Registers a global click event and output 'click' to the console.

- 🧠 **FSRS Algorithm** - Advanced spaced repetition scheduling- Registers a global interval which logs 'setInterval' to the console.

- 🔍 **Flashcard Browser** - View, search, and manage all your flashcards

- ⚡ **Fast Scanning** - Efficient vault-wide flashcard detection## First time developing plugins?



## Getting StartedQuick starting guide for new plugin devs:



### 1. Enable Flashcard Parsing- Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.

- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).

**Important:** Flashly only parses notes that are explicitly tagged for flashcard parsing.- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.

- Install NodeJS, then run `npm i` in the command line under your repo folder.

To enable flashcard parsing in a note, add the `flashcards` tag to the frontmatter:- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.

- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.

```yaml- Reload Obsidian to load the new version of your plugin.

---- Enable plugin in settings window.

tags: [flashcards]- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

---

```## Releasing new releases



**Without this tag, your note will be ignored during scanning**, even if it contains flashcard syntax.- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.

- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.

### 2. Create Flashcards- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases

- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.

Once your note is tagged, you can use any of these formats:- Publish the release.



#### Q::A Format (Inline)> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.

```markdown> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

What is the capital of France::Paris

What is 2+2::4## Adding your plugin to the community plugin list

```

- Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).

#### ?? Format (Multi-line)- Publish an initial version.

```markdown- Make sure you have a `README.md` file in the root of your repo.

What is photosynthesis?- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

??

The process by which plants convert light energy into chemical energy.## How to use

```

- Clone this repo.

#### {Cloze} Format- Make sure your NodeJS is at least v16 (`node --version`).

```markdown- `npm i` or `yarn` to install dependencies.

The {mitochondria} is the powerhouse of the cell.- `npm run dev` to start compilation in watch mode.

Paris is the capital of {France}.

```## Manually installing the plugin



#### Header Format- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

```markdown

## What is a cell?## Improve code quality with eslint (optional)

- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code. 

The basic structural unit of all living organisms.- To use eslint with this project, make sure to install eslint from terminal:

```  - `npm install -g eslint`

- To use eslint to analyze this project use this command:

### 3. Scan Your Vault  - `eslint main.ts`

  - eslint will then create a report with suggestions for code improvement by file and line number.

Use the command palette (`Ctrl/Cmd+P`) and run:- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:

- **"Flashly: Scan vault for flashcards"**  - `eslint ./src/`



This will find all flashcards in tagged notes and add them to your collection.## Funding URL



### 4. Review Your CardsYou can include funding URLs where people who use your plugin can financially support it.



Click the flashcard icon in the ribbon or use the command:The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

- **"Flashly: Open Flashcard Browser"**

```json

Browse your decks and start reviewing!{

    "fundingUrl": "https://buymeacoffee.com"

## Custom Configuration}

```

### Custom Flashcard Tags

If you have multiple URLs, you can also do:

You can configure custom tags in **Settings → Flashly → Parser Settings**.

```json

Default tags: `flashcards`, `cards`{

    "fundingUrl": {

### Custom Deck Names        "Buy Me a Coffee": "https://buymeacoffee.com",

        "GitHub Sponsor": "https://github.com/sponsors",

Control how your flashcards are organized into decks:        "Patreon": "https://www.patreon.com/"

    }

**Option 1: Frontmatter deck property**}

```yaml```

---

tags: [flashcards]## API Documentation

deck: My Custom Deck

---See https://github.com/obsidianmd/obsidian-api

```

**Option 2: Subtags**
```yaml
---
tags: [flashcards/biology]
---
```
This creates a "biology" deck.

**Option 3: Auto-naming (Default)**  
If no custom deck is specified, cards use the note's filename as the deck name.

## Examples

### Complete Example

See `examples/complete-example.md` for a comprehensive demonstration of all features.

### Simple Example

```markdown
---
tags: [flashcards]
deck: Spanish Vocabulary
---

# Spanish Study Notes

Hola::Hello
Adiós::Goodbye

## What does "gracias" mean?

Thank you
```

This creates a deck called "Spanish Vocabulary" with 3 flashcards.

## Development

### Install Dependencies
```bash
npm install
```

### Development Build (Watch Mode)
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Installation

### From Obsidian Community Plugins
1. Open Settings → Community Plugins
2. Search for "Flashly"
3. Click Install, then Enable

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder: `<vault>/.obsidian/plugins/flashly/`
3. Copy the files into that folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community Plugins

## Troubleshooting

### My flashcards aren't being found

✅ **Make sure your note has the `flashcards` tag in frontmatter:**

```yaml
---
tags: [flashcards]
---
```

Without this tag, the note will not be scanned.

### Cards appear from unintended notes

If you're seeing flashcards from notes you didn't intend to parse, check if those notes have the `flashcards` tag. Remove the tag from notes you don't want parsed, then re-scan your vault.

### How do I remove unwanted flashcards?

1. Remove the `flashcards` tag from the note
2. Run "Scan vault for flashcards" again
3. The cards from that note will be automatically deleted

## Contributing

Contributions are welcome! Please see the development section above for setup instructions.

## License

MIT License - See LICENSE file for details

## Support

- 🐛 [Report a Bug](https://github.com/SamW7140/Flashly-/issues)
- 💡 [Request a Feature](https://github.com/SamW7140/Flashly-/issues)
- 📖 [Documentation](https://github.com/SamW7140/Flashly-/tree/master/docs)
