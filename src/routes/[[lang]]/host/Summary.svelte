<script lang="ts">
	import { assertUnreachable } from '$lib';
	import { playBackendReadyIdConfig } from '$lib/clientOnly';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { FuizConfig, FuizOptions } from '$lib/types';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Download from '~icons/material-symbols/download';
	import Repeat from '~icons/material-symbols/repeat';

	let {
		stats,
		player_count,
		config,
		options,
		results
	}: {
		stats: [number, number][];
		player_count: number;
		config: FuizConfig;
		options: FuizOptions;
		results: { [k: string]: number[] };
	} = $props();
</script>

<TypicalPage>
	<div id="summary">
		<div id="actions">
			<div class="action-container">
				<FancyButton onclick={() => playBackendReadyIdConfig(config, options)}>
					<div class="action">
						<Repeat height="1.1em" width="1.1em" />
						{m.play_again()}
					</div>
				</FancyButton>
			</div>
			{#if Object.keys(results).length > 0}
				<div class="action-container">
					<FancyAnchorButton
						href="data:text/csv;charset=utf-8,{encodeURIComponent(
							Object.entries(results)
								.map(([team, scores]) => `${team},${scores.join(',')}`)
								.join('\n')
						)}"
						download="results.csv"
					>
						<div class="action">
							<Download height="1.1em" width="1.1em" />
							{m.download_results()}
						</div>
					</FancyAnchorButton>
				</div>
			{/if}
		</div>
		<div id="lines">
			{#each config.slides as slide, index (slide.id)}
				{@const [correct, wrong] = stats.at(index) || [0, 0]}
				{@const unanswered = Math.max(0, player_count - correct - wrong)}
				{@const title = ((slide) => {
					switch (true) {
						case 'MultipleChoice' in slide:
							return slide.MultipleChoice.title;
						case 'Order' in slide:
							return slide.Order.title;
						case 'TypeAnswer' in slide:
							return slide.TypeAnswer.title;
						default:
							return assertUnreachable(slide);
					}
				})(slide)}
				<div class="line">
					<div class="label">
						<span class="num">{m.question_text()} {index + 1}</span>
						<span
							class="score"
							title="{correct} {m.correct()} · {wrong} {m.wrong()} · {unanswered} {m.unanswered()}"
						>
							{correct}/{player_count}
						</span>
					</div>
					<div class="card">{title}</div>
				</div>
			{/each}
		</div>
	</div>
</TypicalPage>

<style>
	#summary {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		gap: 0.8em;
		width: 100%;
		max-width: min(50ch, 90vw);
		padding: 0.4em;
		box-sizing: border-box;
	}

	#actions {
		display: flex;
		gap: 0.3em;
		flex-wrap: wrap;
	}

	#actions .action-container {
		flex: 1;
	}

	#actions .action {
		padding: 0 0.3em;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
	}

	#lines {
		display: flex;
		flex-direction: column;
		gap: 0.8em;
	}

	.line {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
	}

	.label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5em;
		padding: 0 0.3em;
		font-size: 0.75em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.7;
	}

	.num {
		font-family: var(--alternative-font);
		font-weight: 800;
	}

	.score {
		padding: 0.15em 0.5em;
		border-radius: 999px;
		background: var(--on-surface);
		color: var(--surface);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		text-transform: none;
		letter-spacing: 0;
	}

	.card {
		border: 1px solid color-mix(in srgb, var(--on-surface) 20%, transparent);
		border-radius: 0.7em;
		background: var(--surface);
		padding: 0.5em 0.7em;
		font-weight: 600;
		overflow-wrap: anywhere;
	}
</style>
