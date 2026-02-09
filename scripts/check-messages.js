import { getLocales, getTranslations } from './message-utils.js';

const en = getTranslations();
const enKeys = Object.keys(en);

const locales = getLocales().filter((l) => l !== 'en');

let failed = false;

for (const locale of locales.sort()) {
	const data = getTranslations(locale);
	const keys = Object.keys(data);
	const errors = [];

	const extra = keys.filter((k) => !enKeys.includes(k));
	const missing = enKeys.filter((k) => !keys.includes(k));

	if (extra.length) {
		errors.push(`extra keys: ${extra.join(', ')}`);
	}

	if (missing.length) {
		errors.push(`missing keys: ${missing.join(', ')}`);
	}

	const filtered = keys.filter((k) => enKeys.includes(k));
	const expected = enKeys.filter((k) => keys.includes(k));
	if (filtered.join(',') !== expected.join(',')) {
		errors.push('key order does not match en.json');
	}

	if (errors.length) {
		console.error(`FAIL ${locale}.json:`);
		for (const e of errors) {
			console.error(`  - ${e}`);
		}
		failed = true;
	} else {
		console.log(`OK   ${locale}.json`);
	}
}

if (failed) {
	console.error('\nMessage files are out of sync with en.json');
	process.exit(1);
} else {
	console.log('\nAll message files are in sync with en.json');
}
