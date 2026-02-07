import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const messagesDir = join(import.meta.dirname, "..", "messages");

const en = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf-8"));
const enKeys = Object.keys(en);

const files = readdirSync(messagesDir).filter(
	(f) => f.endsWith(".json") && f !== "en.json",
);

let failed = false;

for (const file of files.sort()) {
	const data = JSON.parse(readFileSync(join(messagesDir, file), "utf-8"));
	const keys = Object.keys(data);
	const errors = [];

	const extra = keys.filter((k) => !enKeys.includes(k));
	const missing = enKeys.filter((k) => !keys.includes(k));

	if (extra.length) {
		errors.push(`extra keys: ${extra.join(", ")}`);
	}

	if (missing.length) {
		errors.push(`missing keys: ${missing.join(", ")}`);
	}

	const filtered = keys.filter((k) => enKeys.includes(k));
	const expected = enKeys.filter((k) => keys.includes(k));
	if (filtered.join(",") !== expected.join(",")) {
		errors.push("key order does not match en.json");
	}

	if (errors.length) {
		console.error(`FAIL ${file}:`);
		for (const e of errors) {
			console.error(`  - ${e}`);
		}
		failed = true;
	} else {
		console.log(`OK   ${file}`);
	}
}

if (failed) {
	console.error("\nMessage files are out of sync with en.json");
	process.exit(1);
} else {
	console.log("\nAll message files are in sync with en.json");
}
