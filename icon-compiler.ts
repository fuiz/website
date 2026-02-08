import type { CustomCompiler } from 'unplugin-icons';

export const SvelteTitleCompiler: CustomCompiler = {
	async compiler(svg) {
		const openTagEnd = svg.indexOf('>', svg.indexOf('<svg '));
		const closeTagStart = svg.lastIndexOf('</svg');
		const innerSvg = svg.slice(openTagEnd + 1, closeTagStart);

		const script = `<script>const{title,...p}=$props()</script>`;
		const titleBlock = `{#if title}<title>{title}</title>{/if}`;
		return `${script}${svg.slice(0, openTagEnd)} {...p}>${titleBlock}${innerSvg}</svg>`;
	},
	extension: '.svelte'
};
