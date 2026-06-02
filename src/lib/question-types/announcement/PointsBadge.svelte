<script lang="ts">
	// Points are almost always the site default (1000), so a number on every
	// splash is noise. We only surface a pill when the value is actually notable,
	// and style it like a game reward chip (Duolingo XP / Jackbox).
	let { pointsAwarded }: { pointsAwarded: number } = $props();

	const STANDARD = 1000;

	type Kind = 'double' | 'half' | 'none' | 'custom';

	const info = $derived.by((): { kind: Kind; text: string } | null => {
		if (pointsAwarded === STANDARD) return null;
		if (pointsAwarded === 0) return { kind: 'none', text: 'No points' };
		if (pointsAwarded === 2 * STANDARD) return { kind: 'double', text: 'Double points' };
		if (pointsAwarded === STANDARD / 2) return { kind: 'half', text: 'Half points' };
		return { kind: 'custom', text: `${pointsAwarded} pts` };
	});
</script>

{#if info}
	<div class="pill {info.kind}">
		{#if info.kind !== 'none'}
			<svg class="star" viewBox="0 0 24 24" aria-hidden="true">
				<path
					fill="currentColor"
					d="M12 2.3l2.83 6.06 6.67.78-4.93 4.52 1.32 6.54L12 17.6l-5.89 3.1 1.32-6.54L2.5 9.64l6.67-.78z"
				/>
			</svg>
		{/if}
		<span class="text">{info.text}</span>
	</div>
{/if}

<style>
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
		padding: 0.32em 0.85em;
		border-radius: 999em;
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 1.05em;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		white-space: nowrap;
		/* Chunky reward-chip depth: a solid bottom lip + a soft drop shadow. */
		box-shadow:
			0 0.2em 0 var(--pill-edge),
			0 0.4em 0.8em -0.2em rgba(0, 0, 0, 0.4);
	}

	.star {
		width: 1.05em;
		height: 1.05em;
		flex: none;
	}

	.double {
		--pill-edge: #c79500;
		background: #ffc800;
		color: #4a3500;
	}

	.half {
		--pill-edge: color-mix(in srgb, black 28%, var(--secondary));
		background: var(--secondary);
		color: var(--on-secondary);
	}

	.custom {
		--pill-edge: color-mix(in srgb, black 28%, var(--primary));
		background: var(--primary);
		color: var(--on-primary);
	}

	.none {
		--pill-edge: color-mix(in srgb, var(--on-surface) 22%, var(--surface-variant));
		background: var(--surface-variant);
		color: var(--on-surface-variant);
	}
</style>
