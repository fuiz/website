type TomlPrimitive = string | number | boolean;
type TomlArray = TomlPrimitive[] | TomlTable[];
type TomlValue = TomlPrimitive | TomlArray | TomlTable;
type TomlTable = { [key: string]: TomlValue | undefined | null };

type Options = {
	newLine?: string;
	inlineTableStart?: number;
	/** Keys written before every other key of the table they appear in. */
	firstKeys?: string[];
	/** Arrays of primitives longer than this are written one item per line. */
	lineWidth?: number;
};

const INDENT = '\t';

function escapeString(value: string) {
	return JSON.stringify(value).replace(/\x7f/g, '\\u007f');
}

const BARE_KEY = /^[A-Za-z0-9_-]+$/;

function formatKey(key: string): string {
	if (BARE_KEY.test(key)) return key;
	return escapeString(key);
}

function formatKeyValue(key: string, formattedValue: string): string {
	return `${formatKey(key)} = ${formattedValue}`;
}

function isTomlTable(value: TomlValue): value is TomlTable {
	return typeof value === 'object' && !Array.isArray(value);
}

function isTableArray(arr: TomlArray): arr is TomlTable[] {
	return arr.length > 0 && arr.every(isTomlTable);
}

function formatPrimitive(value: TomlPrimitive): string {
	if (typeof value === 'string') return escapeString(value);
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	if (typeof value === 'number') {
		if (Number.isNaN(value)) return 'nan';
		if (value === Infinity) return 'inf';
		if (value === -Infinity) return '-inf';
		return value.toString();
	}
	return String(value);
}

function formatInlineTable(table: TomlTable, nl: string): string {
	const parts: string[] = [];
	for (const [key, value] of Object.entries(table)) {
		if (value === undefined || value === null) continue;
		parts.push(formatKeyValue(key, formatValueInline(value, nl)));
	}
	return `{ ${parts.join(', ')} }`;
}

function formatValueInline(value: TomlValue, nl: string): string {
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return formatPrimitive(value);
	}
	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const items = (value as TomlValue[]).map((item) => formatValueInline(item, nl));
		return `[${items.join(', ')}]`;
	}
	return formatInlineTable(value, nl);
}

function formatMultilineArray(key: string, items: string[], nl: string): string {
	return [`${formatKey(key)} = [`, ...items.map((item) => `${INDENT}${item},`), ']'].join(nl);
}

function formatPrimitiveArray(
	key: string,
	arr: TomlPrimitive[],
	options: Required<Options>
): string {
	const items = arr.map(formatPrimitive);
	const singleLine = formatKeyValue(key, `[${items.join(', ')}]`);
	if (arr.length === 0 || singleLine.length <= options.lineWidth) return singleLine;
	return formatMultilineArray(key, items, options.newLine);
}

function serializeTable(
	table: TomlTable,
	keyPath: string[],
	depth: number,
	options: Required<Options>
): string {
	const { newLine: nl, inlineTableStart, firstKeys } = options;
	const lines: string[] = [];

	const primitiveEntries: [string, TomlPrimitive][] = [];
	const arrayOfPrimitivesEntries: [string, TomlPrimitive[]][] = [];
	const inlineTableEntries: [string, TomlTable][] = [];
	const inlineTableArrayEntries: [string, TomlTable[]][] = [];
	const subTableEntries: [string, TomlTable][] = [];
	const tableArrayEntries: [string, TomlTable[]][] = [];

	const entries = Object.entries(table);
	const rank = (key: string) => {
		const index = firstKeys.indexOf(key);
		return index === -1 ? firstKeys.length : index;
	};
	entries.sort(([a], [b]) => rank(a) - rank(b));

	for (const [key, value] of entries) {
		if (value === undefined || value === null) continue;

		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			primitiveEntries.push([key, value]);
		} else if (Array.isArray(value)) {
			if (value.length === 0) {
				arrayOfPrimitivesEntries.push([key, []]);
			} else if (isTableArray(value)) {
				if (depth + 1 >= inlineTableStart) {
					inlineTableArrayEntries.push([key, value]);
				} else {
					tableArrayEntries.push([key, value]);
				}
			} else {
				arrayOfPrimitivesEntries.push([key, value as TomlPrimitive[]]);
			}
		} else if (isTomlTable(value)) {
			if (depth + 1 >= inlineTableStart) {
				inlineTableEntries.push([key, value]);
			} else {
				subTableEntries.push([key, value]);
			}
		}
	}

	for (const [key, value] of primitiveEntries) {
		lines.push(formatKeyValue(key, formatPrimitive(value)));
	}

	for (const [key, arr] of arrayOfPrimitivesEntries) {
		lines.push(formatPrimitiveArray(key, arr, options));
	}

	for (const [key, value] of inlineTableEntries) {
		lines.push(formatKeyValue(key, formatInlineTable(value, nl)));
	}

	// Arrays of tables nested too deep for [[headers]]: one inline table per line
	for (const [key, tables] of inlineTableArrayEntries) {
		const items = tables.map((entry) => formatInlineTable(entry, nl));
		lines.push(formatMultilineArray(key, items, nl));
	}

	// A header that directly follows its parent's header gets no blank line before it
	const header = (text: string) => {
		if (lines.length > 0) lines.push('');
		lines.push(text);
	};

	for (const [key, subTable] of subTableEntries) {
		const subPath = [...keyPath, key];
		header(`[${subPath.map(formatKey).join('.')}]`);
		lines.push(serializeTable(subTable, subPath, depth + 1, options));
	}

	for (const [key, tables] of tableArrayEntries) {
		const subPath = [...keyPath, key];
		for (const entry of tables) {
			header(`[[${subPath.map(formatKey).join('.')}]]`);
			lines.push(serializeTable(entry, subPath, depth + 1, options));
		}
	}

	return lines.join(nl);
}

export function stringifyToToml(obj: TomlTable, options?: Options): string {
	const resolvedOptions: Required<Options> = {
		newLine: options?.newLine ?? '\n',
		inlineTableStart: options?.inlineTableStart ?? Infinity,
		firstKeys: options?.firstKeys ?? [],
		lineWidth: options?.lineWidth ?? Infinity
	};

	const result = serializeTable(obj, [], 0, resolvedOptions);

	// Trim leading blank lines from sub-tables, ensure trailing newline
	return result.replace(/^\n+/, '') + resolvedOptions.newLine;
}
