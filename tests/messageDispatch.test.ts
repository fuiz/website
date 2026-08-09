import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Guards the seam between the protocol and the screens that render it.
 *
 * A slide type can be fully built (types, handler, components, i18n) and still
 * be dead on arrival because its branch is missing from the socket's `if/else`
 * chain. Nothing else catches that: the handler still compiles, the components
 * still type-check, and every test still passes, but the screen never updates
 * because no message ever reaches it. Both sides ship the same union, so both
 * sides have to answer for every member of it.
 */

const ROOT = new URL('../src/routes/[[lang]]/', import.meta.url);

function read(path: string): string {
	return readFileSync(new URL(path, ROOT), 'utf8');
}

/** The members of the `IncomingMessage` union declared in a side's `index.ts`. */
function incomingKinds(indexSource: string): string[] {
	const start = indexSource.indexOf('export type IncomingMessage');
	// The union runs to the next top-level declaration; slicing at the first `;`
	// would stop inside its first member.
	const rest = indexSource.slice(start + 1);
	const next = rest.search(/\n(?:export|type|const|function|\/\*\*)/);
	const body = next === -1 ? rest : rest.slice(0, next);
	const kinds = [...body.matchAll(/^\t+(\w+):/gm)].map((match) => match[1]);
	return [...new Set(kinds)];
}

describe.each([
	{ side: 'host', index: 'host/index.ts', screen: 'host/Host.svelte' },
	{ side: 'play', index: 'play/index.ts', screen: 'play/Play.svelte' }
])('$side socket', ({ index, screen }) => {
	const kinds = incomingKinds(read(index));
	const source = read(screen);

	it('declares every slide type in its incoming union', () => {
		// Sanity: if the parse breaks, the coverage assertion below would pass
		// vacuously.
		expect(kinds).toContain('Game');
		expect(kinds.length).toBeGreaterThanOrEqual(11);
	});

	it('dispatches every kind the union declares', () => {
		const undispatched = kinds.filter((kind) => !source.includes(`'${kind}' in newMessage`));
		expect(undispatched).toEqual([]);
	});
});
