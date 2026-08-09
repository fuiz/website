<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';

	export type Response = {
		text: string;
		/** Shown as a badge: a repeat count, a vote tally, whatever fits. */
		badge?: number;
	};

	/**
	 * A card wall of written responses, used for open-ended answers and for the
	 * brainstorm board. Cards flow into as many columns as the width allows and
	 * the wall scrolls rather than shrinking the text.
	 */
	let {
		responses,
		emptyMessage = undefined,
		badgeLabel = undefined
	}: {
		responses: Response[];
		emptyMessage?: string | undefined;
		/** Screen-reader description of what the badge counts. */
		badgeLabel?: string | undefined;
	} = $props();
</script>

{#if responses.length === 0}
	<div class="empty">{emptyMessage ?? m.no_responses()}</div>
{:else}
	<ul class="wall">
		{#each responses as response, index (index)}
			<li class={['card', paletteClass(index)]}>
				<span class="text">{response.text}</span>
				{#if response.badge !== undefined && response.badge > 0}
					<span class="badge" aria-label={badgeLabel}>{response.badge}</span>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	.wall {
		list-style: none;
		margin: 0;
		padding: 0.6em;
		height: 100%;
		overflow-y: auto;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14em, 1fr));
		align-content: start;
		gap: 0.5em;
	}

	.card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5em;
		padding: 0.55em 0.7em;
		border-radius: 0.55em;
		background: var(--btn-bg);
		box-shadow: 0 0.2em 0 var(--btn-deep);
		color: #ffffff;
		overflow-wrap: anywhere;
		animation: rise 320ms cubic-bezier(0.2, 1.2, 0.3, 1) both;
	}

	.text {
		flex: 1;
		min-width: 0;
		line-height: 1.3;
	}

	.badge {
		flex: none;
		display: grid;
		place-items: center;
		min-width: 1.7em;
		height: 1.7em;
		padding: 0 0.4em;
		border-radius: 1em;
		background: rgba(255, 255, 255, 0.92);
		color: var(--btn-deep);
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 0.9em;
	}

	.empty {
		display: grid;
		place-items: center;
		height: 100%;
		opacity: 0.6;
		font-size: 1.4em;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(0.4em);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			animation: none;
		}
	}
</style>
