<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { fly } from 'svelte/transition';
	import { buttonSymbols } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import type { TextOrMedia } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Check from '~icons/custom/check';

	let {
		answers,
		showAnswers,
		onsubmit
	}: {
		answers: (TextOrMedia | undefined)[];
		showAnswers: boolean;
		onsubmit?: (answers: number[]) => void;
	} = $props();

	let selectedIndices = new SvelteSet<number>();
	let count = $derived(selectedIndices.size);

	function toggleIndex(index: number) {
		if (selectedIndices.has(index)) selectedIndices.delete(index);
		else selectedIndices.add(index);
	}

	function submit() {
		if (onsubmit && count > 0) onsubmit([...selectedIndices]);
	}
</script>

<div class="root">
	<div class="grid-wrap">
		<div class="grid" class:icon-grid={!showAnswers}>
			{#each answers as answer, index (index)}
				{@const symbol = buttonSymbols[index % buttonSymbols.length]}
				<FancyButton palette={index} height="100%" onclick={() => toggleIndex(index)}>
					{#if showAnswers}
						<div class="row">
							<div class="checkbox" class:checked={selectedIndices.has(index)}>
								{#if selectedIndices.has(index)}
									<Check height="1em" width="1em" />
								{/if}
							</div>
							<div class="text">{answer?.Text}</div>
							<div class="icon">
								<symbol.icon title={symbol.label} height="1em" width="1em" />
							</div>
						</div>
					{:else}
						<div class="tile">
							<div class="checkbox corner" class:checked={selectedIndices.has(index)}>
								{#if selectedIndices.has(index)}
									<Check height="1em" width="1em" />
								{/if}
							</div>
							<div class="tile-icon">
								<symbol.icon title={symbol.label} height="100%" width="100%" />
							</div>
						</div>
					{/if}
				</FancyButton>
			{/each}
		</div>
	</div>
	<div class="dock">
		{#if count === 0}
			<div class="hint" in:fly={{ y: 8, duration: 150 }}>{m.select_all_that_apply()}</div>
		{:else}
			<div class="bar" in:fly={{ y: 40, duration: 250 }}>
				<div class="pulse">
					<FancyButton onclick={submit}>
						<div class="bar-label">{m.submit()}</div>
					</FancyButton>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.root {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.grid-wrap {
		flex: 1;
		min-height: 0;
		container-type: inline-size;
		font-size: 1.1em;
	}

	.grid {
		grid-template-columns: 1fr 1fr;
		height: 100%;
		display: grid;
		gap: 0.2em;
		padding: 0.2em;
		box-sizing: border-box;
		align-content: end;
	}

	@container (width <= 40ch) {
		.grid {
			grid-template-columns: 1fr;
		}

		.grid.icon-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.grid.icon-grid {
		grid-auto-rows: 1fr;
		gap: 0.8em;
		padding: 0.8em;
		align-content: stretch;
	}

	.row {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.1em;
	}

	.checkbox {
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 1.5em;
		width: 1.5em;
		margin-inline-start: 0.2em;
		border-radius: 0.3em;
		border: 0.15em solid rgba(255, 255, 255, 0.85);
		background: rgba(255, 255, 255, 0.15);
		box-sizing: border-box;
	}

	.checkbox.checked {
		background: #ffffff;
		color: var(--btn-deep);
	}

	.text {
		height: 100%;
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		word-break: break-word;
	}

	.icon {
		display: flex;
		padding: 0.2em;
	}

	.tile {
		position: relative;
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.tile-icon {
		aspect-ratio: 1;
		max-height: 60%;
		max-width: 60%;
		display: flex;
		align-items: center;
		height: 100%;
	}

	.checkbox.corner {
		position: absolute;
		top: 0.3em;
		inset-inline-start: 0.3em;
		margin-inline-start: 0;
	}

	.dock {
		flex: none;
		padding: 0.2em;
		min-height: 3.4em;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hint {
		font-weight: 500;
		opacity: 0.6;
		padding: 0.6em;
	}

	.bar {
		width: 100%;
		font-size: 1.15em;
	}

	.pulse {
		border-radius: 0.8em;
		animation: pulse 1.4s ease-out infinite;
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 55%, transparent);
		}
		70% {
			box-shadow: 0 0 0 0.7em transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse {
			animation: none;
		}
	}

	.bar-label {
		text-align: center;
		font-weight: 700;
		padding: 0.3em 0.6em;
	}
</style>
