import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const messagesDir = join(import.meta.dirname, "..", "messages");
const srcDir = join(import.meta.dirname, "..", "src");

const en = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf-8"));
const keys = Object.keys(en).filter((k) => !k.startsWith("$"));

function collectFiles(dir) {
	const results = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (entry === "paraglide") continue;
		if (statSync(full).isDirectory()) {
			results.push(...collectFiles(full));
		} else if ([".svelte", ".ts", ".js"].includes(extname(full))) {
			results.push(full);
		}
	}
	return results;
}

const files = collectFiles(srcDir);
const allSource = files.map((f) => readFileSync(f, "utf-8")).join("\n");

const unused = keys.filter((key) => {
	const pattern = `m.${key}`;
	return !allSource.includes(pattern);
});

if (unused.length) {
	console.error(`Found ${unused.length} unused translation key(s):\n`);
	for (const key of unused) {
		console.error(`  - ${key}: ${JSON.stringify(en[key])}`);
	}
	process.exit(1);
} else {
	console.log("All translation keys are used.");
}
