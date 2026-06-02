<script lang="ts">
	import type { QuestionType } from '$lib/types';
	import AnnouncementHero from '../AnnouncementHero.svelte';
	import PointsBadge from '../PointsBadge.svelte';

	let {
		questionType,
		label,
		pointsAwarded
	}: {
		questionType: QuestionType;
		label: string;
		pointsAwarded: number;
	} = $props();
</script>

<!-- Composition: the hero springs in at centre, the type rides in on a ribbon
     below. No background wash. -->
<div class="scene">
	<div class="hero"><AnnouncementHero {questionType} /></div>

	<div class="caption">
		<div class="plank"><span class="label">{label}</span></div>
		<PointsBadge {pointsAwarded} />
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

	.hero {
		animation: pop 0.7s cubic-bezier(0.2, 1.3, 0.3, 1) 0.1s both;
	}

	.caption {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6em;
		perspective: 600px;
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

	@keyframes pop {
		0% {
			opacity: 0;
			transform: scale(0.3) rotate(-6deg);
		}
		55% {
			opacity: 1;
			transform: scale(1.08) rotate(3deg);
		}
		75% {
			transform: scale(0.97) rotate(-1.5deg);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotate(0);
		}
	}
	@keyframes sweep {
		0% {
			opacity: 0;
			transform: translateY(1em) rotateX(85deg);
		}
		100% {
			opacity: 1;
			transform: translateY(0) rotateX(0);
		}
	}
	@keyframes rise {
		0% {
			opacity: 0;
			transform: translateY(0.7em) scale(0.8);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scene :global(*) {
			animation-duration: 0.001s !important;
			animation-delay: 0s !important;
		}
		.hero,
		.plank,
		.caption :global(.pill) {
			opacity: 1 !important;
			transform: none !important;
		}
	}
</style>
