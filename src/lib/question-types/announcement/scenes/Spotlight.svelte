<script lang="ts">
	import { flyOut } from '$lib/animation/flyAway';
	import type { QuestionType } from '$lib/types';
	import AnnouncementHero from '../AnnouncementHero.svelte';
	import PointsBadge from '../PointsBadge.svelte';

	let {
		questionType,
		label,
		subtext,
		pointsAwarded
	}: {
		questionType: QuestionType;
		label: string;
		// Optional clarifier under the type label (e.g. single vs. multiple answers).
		subtext?: string;
		pointsAwarded: number;
	} = $props();
</script>

<!-- Composition: the hero's own pieces fly in from their own directions (each
     hero glyph handles that), the type rides in on a ribbon from the left, the
     points badge from the right. On exit each flies back out. -->
<div class="scene">
	<AnnouncementHero {questionType} />

	<div class="caption">
		<div class="exit-piece label-group" out:flyOut|global={{ x: -125, y: 30, rotate: -16 }}>
			<div class="plank"><span class="label">{label}</span></div>
			{#if subtext}
				<span class="subtext">{subtext}</span>
			{/if}
		</div>
		<div class="exit-piece" out:flyOut|global={{ x: 125, y: 45, rotate: 16 }}>
			<PointsBadge {pointsAwarded} />
		</div>
	</div>
</div>

<style>
	.scene {
		position: absolute;
		inset: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.4em;
		font-size: clamp(0.8rem, 3.6cqmin, 2.2rem);
	}

	.exit-piece {
		display: inline-flex;
	}

	.label-group {
		flex-direction: column;
		align-items: center;
		gap: 0.55em;
	}

	.subtext {
		font-family: var(--alternative-font);
		font-weight: 700;
		font-size: 1.15em;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--on-surface-variant);
		animation: fade-up 0.5s cubic-bezier(0.2, 0.9, 0.2, 1) 0.95s both;
	}

	.caption {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6em;
	}

	.plank {
		transform-origin: center bottom;
		padding: 0.5em 1em;
		border-radius: 0.55em;
		background: var(--secondary);
		color: var(--on-secondary);
		box-shadow:
			0 0.16em 0 color-mix(in srgb, black 35%, var(--secondary)),
			0 0.6em 1.1em -0.3em rgba(0, 0, 0, 0.45);
		animation: sweep 0.7s cubic-bezier(0.2, 0.9, 0.2, 1) 0.5s both;
	}

	.label {
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 2.7em;
		line-height: 1.1;
	}

	.caption :global(.pill) {
		animation: rise 0.5s cubic-bezier(0.2, 1.4, 0.3, 1) 0.75s both;
	}

	/* Label slides in from the left. */
	@keyframes sweep {
		0% {
			opacity: 0;
			transform: translateX(-75vw) rotate(-5deg);
		}
		70% {
			opacity: 1;
			transform: translateX(4%) rotate(2deg);
		}
		100% {
			opacity: 1;
			transform: translateX(0) rotate(0);
		}
	}
	/* Subtext settles in just after the type label lands. */
	@keyframes fade-up {
		0% {
			opacity: 0;
			transform: translateY(0.5em);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	/* Points badge slides in from the right. */
	@keyframes rise {
		0% {
			opacity: 0;
			transform: translateX(70vw) scale(0.9);
		}
		70% {
			opacity: 1;
			transform: translateX(-4%) scale(1.03);
		}
		100% {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scene :global(*) {
			animation-duration: 0.001s !important;
			animation-delay: 0s !important;
		}
		.plank,
		.subtext,
		.caption :global(.pill) {
			opacity: 1 !important;
			transform: none !important;
		}
	}
</style>
