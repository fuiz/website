<script lang="ts">
	// A quiz as the library shows one, drawn in thin lines: a thumbnail with the
	// title and author beneath, in the library tile's proportions. The
	// thumbnail pictures what the quiz is about, the way a real cover does.
	let { subject }: { subject: 'music' | 'leaf' | 'globe' | 'flask' | 'atom' } = $props();
</script>

<span class="tile">
	<span class="thumbnail">
		<svg viewBox="0 0 60 34" aria-hidden="true">
			{#if subject === 'music'}
				<ellipse class="solid" cx="24" cy="25" rx="3.4" ry="2.5" transform="rotate(-20 24 25)" />
				<ellipse class="solid" cx="36" cy="22" rx="3.4" ry="2.5" transform="rotate(-20 36 22)" />
				<path d="M27.2 24 V9.5 L39.2 6.5 V21" />
			{:else if subject === 'leaf'}
				<path d="M19 28 C19 14 29 6 42 6 C42 19 33 28 19 28 Z" />
				<path d="M19 28 L34 14" />
			{:else if subject === 'globe'}
				<circle cx="30" cy="17" r="11" />
				<ellipse cx="30" cy="17" rx="5" ry="11" />
				<path d="M19 17 H41" />
			{:else if subject === 'flask'}
				<path
					d="M26 6 H34 M27.5 6 V14 L19.5 27 Q18.5 29 20.5 29 H39.5 Q41.5 29 40.5 27 L32.5 14 V6"
				/>
				<path class="solid" d="M22.6 22 H37.4 L40.5 27 Q41.5 29 39.5 29 H20.5 Q18.5 29 19.5 27 Z" />
			{:else}
				<ellipse cx="30" cy="17" rx="12" ry="4.5" />
				<ellipse cx="30" cy="17" rx="12" ry="4.5" transform="rotate(60 30 17)" />
				<ellipse cx="30" cy="17" rx="12" ry="4.5" transform="rotate(-60 30 17)" />
				<circle class="solid" cx="30" cy="17" r="1.8" />
			{/if}
		</svg>
	</span>
	<span class="title"></span>
	<span class="author"></span>
</span>

<style>
	.tile {
		--ink: color-mix(in srgb, var(--on-surface) 28%, transparent);
		display: flex;
		flex-direction: column;
		gap: 0.28em;
		box-sizing: border-box;
		/* The library tile's 6 by 5. */
		width: 4.8em;
		height: 4em;
		padding-bottom: 0.45em;
		overflow: hidden;
		border: 2px solid var(--ink);
		border-radius: 0.6em;
	}

	.thumbnail {
		display: flex;
		flex: 1;
		margin-bottom: 0.1em;
		background: color-mix(in srgb, var(--on-surface) 6%, transparent);
	}

	svg {
		width: 100%;
		height: 100%;
	}

	svg * {
		fill: none;
		stroke: color-mix(in srgb, var(--on-surface) 45%, transparent);
		stroke-width: 2px;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	svg .solid {
		fill: color-mix(in srgb, var(--on-surface) 45%, transparent);
		stroke: none;
	}

	.title,
	.author {
		height: 0.28em;
		margin-inline: 0.45em;
		border-radius: 1em;
		background: var(--ink);
	}

	.title {
		width: 62%;
	}

	.author {
		width: 36%;
		height: 0.22em;
	}
</style>
