<script>
	import * as m from '$lib/paraglide/messages.js';

	import Icon from '$lib/media/Icon.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';

	/** @typedef {{points: number, position: number} | undefined} Score */

	/** @type {{score: Score; points: number[]; config: import('$lib/types').IdlessFuizConfig;}} */
	let { score, points, config } = $props();
</script>

<TypicalPage>
	<div>
		<div style:margin-bottom="0.5em">
			{#if score}
				{m.placed_summary({
					position: score.position + 1,
					points: score.points
				})}
			{:else}
				{m.not_on_leaderboard()}
			{/if}
		</div>
		<div id="summary">
			{#each config.slides as slide, index}
				{@const correct = points.at(index) || 0 > 0}
				<div class="line">
					{#if 'MultipleChoice' in slide}
						<div class="question-text" title={slide.MultipleChoice.title}>
							{slide.MultipleChoice.title}
						</div>
					{:else if 'Order' in slide}
						<div class="question-text" title={slide.Order.title}>
							{slide.Order.title}
						</div>
					{:else}
						<div class="question-text" title={slide.TypeAnswer.title}>
							{slide.TypeAnswer.title}
						</div>
					{/if}
					{#if correct}
						<Icon src="$lib/assets/correct.svg" alt={m.correct()} size="1em" />
					{:else}
						<Icon src="$lib/assets/wrong.svg" alt={m.wrong()} size="1em" />
						<div class="answers">
							<div>{m.correct_answers()}</div>
							{#if 'TypeAnswer' in slide}
								<ul>
									{#each slide.TypeAnswer.answers as answer}
										<li>
											{answer}
										</li>
									{/each}
								</ul>
							{:else if 'Order' in slide}
								<ol>
									{#each slide.Order.answers as answer}
										<li>
											{answer}
										</li>
									{/each}
								</ol>
							{:else}
								<ul>
									{#each slide.MultipleChoice.answers.filter((a) => a.correct) as answer}
										<li>
											{answer.content.Text}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</TypicalPage>

<style>
	#summary {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		width: 100%;
		max-width: min(40ch, 90vw);
		margin: 0 auto;
	}

	.line {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
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

	.answers {
		width: 100%;
	}

	ul {
		display: flex;
		flex-direction: column;
		margin: 0;
	}
</style>
