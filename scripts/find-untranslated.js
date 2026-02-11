import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { parse } from 'svelte/compiler';
import { walk } from 'zimmerframe';
import { getTranslations } from './message-utils.js';

const srcDir = join(import.meta.dirname, '..', 'src');
const root = join(import.meta.dirname, '..');

const USER_FACING_ATTRS = new Set(['title', 'alt', 'placeholder', 'aria-label']);

// Paths (relative to project root) to skip entirely
const IGNORED_PATHS = ['src/routes/[[lang]]/privacy'];

// Build reverse lookup: lowercase English value -> key(s)
const en = getTranslations();
const valuesToKeys = new Map();
for (const [key, value] of Object.entries(en)) {
	const lower = value.toLowerCase();
	if (valuesToKeys.has(lower)) {
		valuesToKeys.get(lower).push(key);
	} else {
		valuesToKeys.set(lower, [key]);
	}
}

function collectFiles(dir) {
	const results = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (entry === 'paraglide') continue;
		if (statSync(full).isDirectory()) {
			results.push(...collectFiles(full));
		} else if (extname(full) === '.svelte') {
			results.push(full);
		}
	}
	return results;
}

function isNonTrivialText(text) {
	const trimmed = text.trim();
	return (
		trimmed.length > 2 && /[A-Za-z]{2,}/.test(trimmed) && !/^[\d\s.,:;!?%|/()-]+$/.test(trimmed)
	);
}

function offsetToLine(source, offset) {
	let line = 1;
	for (let i = 0; i < offset && i < source.length; i++) {
		if (source[i] === '\n') line++;
	}
	return line;
}

function suggestKey(value) {
	const keys = valuesToKeys.get(value.toLowerCase());
	if (keys) {
		return ` (existing key: ${keys.map((k) => `m.${k}()`).join(', ')})`;
	}
	return '';
}

const files = collectFiles(srcDir);
let count = 0;

for (const file of files) {
	const relPath = file.replace(root + '/', '');
	if (IGNORED_PATHS.some((p) => relPath.startsWith(p))) continue;

	const source = readFileSync(file, 'utf-8');

	let ast;
	try {
		ast = parse(source, { modern: true });
	} catch {
		continue;
	}

	function report(node, kind, value) {
		const line = offsetToLine(source, node.start);
		count++;
		console.log(`${relPath}:${line}`);
		console.log(`  [${kind}] ${JSON.stringify(value)}${suggestKey(value)}`);
		console.log();
	}

	// Check if a node is preceded by <!-- i18n-ignore --> in its parent Fragment
	function hasPrecedingIgnore(node, fragment) {
		if (!fragment?.nodes) return false;
		const idx = fragment.nodes.indexOf(node);
		for (let i = idx - 1; i >= 0; i--) {
			const prev = fragment.nodes[i];
			if (prev.type === 'Text' && !prev.data.trim()) continue;
			return prev.type === 'Comment' && prev.data.trim() === 'i18n-ignore';
		}
		return false;
	}

	walk(
		ast.fragment,
		{ ignored: false },
		{
			_(node, { state, next, path }) {
				const parent = path.at(-1);

				// Propagate ignored state for elements preceded by <!-- i18n-ignore -->
				if (node.fragment && parent?.type === 'Fragment' && hasPrecedingIgnore(node, parent)) {
					next({ ignored: true });
					return;
				}

				if (!state.ignored) {
					// Text nodes: only direct element content (parent is Fragment)
					if (node.type === 'Text' && parent?.type === 'Fragment' && isNonTrivialText(node.data)) {
						if (!hasPrecedingIgnore(node, parent)) {
							report(node, 'text', node.data.trim());
						}
					}

					// Attributes with static string values on user-facing attr names
					if (node.type === 'Attribute' && USER_FACING_ATTRS.has(node.name)) {
						if (Array.isArray(node.value)) {
							const allText = node.value.every((v) => v.type === 'Text');
							if (allText) {
								const text = node.value.map((v) => v.data).join('');
								if (isNonTrivialText(text)) {
									report(node, `attr:${node.name}`, text);
								}
							}
						}
					}
				}

				next();
			}
		}
	);
}

if (count) {
	console.log(`Found ${count} potential untranslated string(s).`);
	process.exit(1);
} else {
	console.log('No untranslated strings found.');
}
