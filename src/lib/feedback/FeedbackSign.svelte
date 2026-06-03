<script lang="ts">
	import Check from '~icons/custom/check';
	import Close from '~icons/custom/close';
	import HourglassTop from '~icons/material-symbols/hourglass-top';
	import MoreHoriz from '~icons/material-symbols/more-horiz';

	type Variant = 'correct' | 'wrong' | 'waiting-others' | 'waiting-host';

	let {
		variant,
		captionMaxWidth = '10ch',
		children
	}: {
		variant: Variant;
		captionMaxWidth?: string;
		children: import('svelte').Snippet;
	} = $props();

	const signs: Record<Variant, { color: string }> = {
		correct: { color: '#1e8053' },
		wrong: { color: 'var(--primary)' },
		'waiting-others': { color: 'var(--tertiary)' },
		'waiting-host': { color: 'var(--secondary)' }
	};
</script>

<div class="container">
	<div class="placard" style:--sign-color={signs[variant].color} aria-hidden="true">
		{#if variant === 'correct'}
			<Check />
		{:else if variant === 'wrong'}
			<Close />
		{:else if variant === 'waiting-others'}
			<MoreHoriz />
		{:else}
			<HourglassTop />
		{/if}
	</div>
	<div class="caption" style:--cap-max={captionMaxWidth}>
		{@render children()}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.placard {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 8em;
		height: 8em;
		background: var(--sign-color);
		border-radius: 1.5rem;
		color: #fff;
	}

	.placard :global(svg) {
		width: 4.85em;
		height: 4.85em;
	}

	.caption {
		font-size: 1.4em;
		font-weight: bold;
		text-align: center;
		max-width: var(--cap-max);
	}
</style>
