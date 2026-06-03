<script lang="ts">
	import { flyIn, flyOut } from '$lib/animation/flyAway';

	// The announcement glyph for Type Answer: a text field and a keypad that
	// spells out the type. Sized in `em` so the parent scene controls the scale.
	const keys = ['T', 'Y', 'P', 'E'];

	// Field drops from the top; each key flies in from a spread of directions.
	const keyDirs = [
		{ x: -60, y: 20, rotate: -12 },
		{ x: -14, y: 60, rotate: -5 },
		{ x: 14, y: 60, rotate: 5 },
		{ x: 60, y: 20, rotate: 12 }
	];
</script>

<div class="type-answer">
	<div
		class="field"
		in:flyIn|global={{ y: -55, duration: 460 }}
		out:flyOut|global={{ y: -55, duration: 420 }}
	>
		<span class="caret"></span>
	</div>
	<div class="keys">
		{#each keys as key, i (i)}
			<span
				class="key palette-{i}"
				in:flyIn|global={{ ...keyDirs[i], duration: 460, delay: 140 + i * 70 }}
				out:flyOut|global={{ ...keyDirs[i], duration: 420, delay: i * 40 }}
			>
				{key}
			</span>
		{/each}
	</div>
</div>

<style>
	.type-answer {
		display: flex;
		flex-direction: column;
		gap: 0.6em;
		width: 9em;
	}

	.field {
		display: flex;
		align-items: center;
		gap: 0.06em;
		height: 2.5em;
		padding: 0 0.75em;
		border-radius: 0.7em;
		background: var(--surface-variant);
		border: 0.12em solid color-mix(in srgb, var(--on-surface) 16%, transparent);
		overflow: hidden;
	}

	.caret {
		width: 0.1em;
		height: 1.35em;
		background: var(--on-surface);
	}

	.keys {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.42em;
	}

	.key {
		aspect-ratio: 1;
		border-radius: 0.5em;
		background: var(--btn-bg);
		box-shadow: 0 0.28em 0 var(--btn-deep);
		color: #ffffff;
		display: grid;
		place-items: center;
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 1.15em;
	}
</style>
