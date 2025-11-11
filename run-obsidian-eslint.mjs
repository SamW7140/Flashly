import config from "./obsidian-eslint.config.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { FlatESLint } = require("./eslint-plugin/node_modules/eslint/lib/unsupported-api.js");

const cwd = process.cwd();
const eslint = new FlatESLint({
  cwd,
  overrideConfigFile: null,
  overrideConfig: config,
});

const targets = ["main.ts", "src", "manifest.json", "LICENSE"];

const results = await eslint.lintFiles(targets);
const formatter = await eslint.loadFormatter("stylish");
const output = formatter.format(results);
if (output.trim().length > 0) {
  console.log(output);
}

const hasIssues = results.some((result) => result.errorCount > 0 || result.warningCount > 0);
if (hasIssues) {
  process.exitCode = 1;
}
