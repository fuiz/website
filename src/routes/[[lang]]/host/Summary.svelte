<script>
	import * as m from '$lib/paraglide/messages.js';

	import { assertUnreachable } from '$lib';
	import { playBackendReadyConfig } from '$lib/clientOnly';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Check from '~icons/material-symbols/check';
	import Close from '~icons/material-symbols/close';
	import TimerOffOutline from '~icons/material-symbols/timer-off-outline';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';

	/** @type {{
	 * stats: [number, number][];
	 * player_count: number;
	 * config: import('$lib/types').IdlessFuizConfig;
	 * options: import('$lib/types').FuizOptions;
	 * results: { [k: string]: number };
	}}*/
	let { stats, player_count, config, options, results } = $props();
</script>

<TypicalPage>
	<div id="summary">
		<div id="actions">
			<div class="action-container">
				<FancyButton onclick={() => playBackendReadyConfig(config, options)}>
					<div class="action">{m.play_again()}</div>
				</FancyButton>
			</div>
			{#if Object.keys(results).length > 0}
				<div class="action-container">
					<FancyAnchorButton
						href="data:text/csv;charset=utf-8,{encodeURIComponent(
							Object.entries(results)
								.map(([team, score]) => `${team},${score}`)
								.join('\n')
						)}"
						download="results.csv"
					>
						<div class="action">{m.download_results()}</div>
					</FancyAnchorButton>
				</div>
			{/if}
		</div>
		{#each config.slides as slide, index}
			{@const [correct, wrong] = stats.at(index) || [0, 0]}
			{@const unanswered = player_count - correct - wrong}
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
				<div class="question-text" {title}>
					{title}
				</div>
				<div class="stat">
					{correct}
					<Check height="1em" title={m.correct()} />
				</div>

				<div class="stat">
					{wrong}
					<Close height="1em" title={m.wrong()} />
				</div>
				<div class="stat">
					{unanswered}
					<TimerOffOutline height="1em" title={m.unanswered()} />
				</div>
			</div>
		{/each}
	</div>
</TypicalPage>

<style>
	#summary {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		gap: 0.2em;
		width: 100%;
		max-width: min(40ch, 90vw);
	}

	#actions {
		display: flex;
		gap: 0.2em;
		flex-wrap: wrap;
	}

	#actions .action-container {
		flex: 1;
	}

	#actions .action {
		padding: 0 0.3em;
		text-align: center;
	}

	.line {
		display: flex;
		overflow: hidden;
		border: 0.15em solid;
		padding: 0.15em 0.5em;
		border-radius: 0.7em;
		background-color: var(--background-color);
		gap: 0.25em;
	}

	.question-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.stat {
		display: flex;
		align-items: center;
	}
</style>
