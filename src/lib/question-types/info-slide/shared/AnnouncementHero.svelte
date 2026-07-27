<script lang="ts">
	import { flyIn, flyOut } from '$lib/animation/flyAway';

	// The announcement glyph for an info slide: a presentation card with a
	// heading and body lines. Info slides go straight to their content, so this
	// only appears where a hero is needed for consistency (e.g. previews).
</script>

<div class="info">
	<div
		class="card"
		in:flyIn|global={{ y: -40, rotate: -4, duration: 460 }}
		out:flyOut|global={{ y: -40, rotate: -4, duration: 420 }}
	>
		<span class="heading palette-0"></span>
		<span class="line"></span>
		<span class="line"></span>
		<span class="line short"></span>
	</div>
</div>

<style>
	.info {
		width: 9em;
	}

	.card {
		width: 100%;
		aspect-ratio: 4 / 3;
		border-radius: 0.7em;
		background: var(--surface-variant);
		border: 0.12em solid color-mix(in srgb, var(--on-surface) 16%, transparent);
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.45em;
		padding: 0.9em;
		box-sizing: border-box;
	}

	.heading {
		height: 0.8em;
		width: 70%;
		border-radius: 1em;
		background: var(--btn-bg);
	}

	.line {
		height: 0.4em;
		border-radius: 1em;
		background: color-mix(in srgb, var(--on-surface) 22%, transparent);
	}

	.line.short {
		width: 55%;
	}
</style>
