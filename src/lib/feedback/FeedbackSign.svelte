<script lang="ts">
	import Check from '~icons/custom/check';
	import Close from '~icons/custom/close';
	import HourglassBottom from '~icons/material-symbols/hourglass-bottom';
	import HourglassTop from '~icons/material-symbols/hourglass-top';
	import MoreHoriz from '~icons/material-symbols/more-horiz';

	type Variant = 'correct' | 'wrong' | 'time-up' | 'waiting-others' | 'waiting-host';

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
		correct: { color: 'var(--correct)' },
		wrong: { color: 'var(--incorrect)' },
		// Not a wrong answer, so not the wrong colour: the time simply ran out.
		'time-up': { color: 'var(--tertiary)' },
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
		{:else if variant === 'time-up'}
			<HourglassBottom />
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
		/* Full size on a phone of ordinary height, smaller on a short one so the
		   card below it stays on screen. */
		--sign-size: min(8em, 18dvh);
		width: var(--sign-size);
		height: var(--sign-size);
		background: var(--sign-color);
		border-radius: 1.5rem;
		color: #fff;
	}

	.placard :global(svg) {
		width: calc(var(--sign-size) * 0.6);
		height: calc(var(--sign-size) * 0.6);
	}

	.caption {
		font-size: 1.4em;
		font-weight: bold;
		text-align: center;
		max-width: var(--cap-max);
	}
</style>
