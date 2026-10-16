<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Forum from '~icons/material-symbols/forum-outline';
	import { inView } from './inView';
	import ShowcaseButton from './ShowcaseButton.svelte';
	import ShowcaseText from './ShowcaseText.svelte';

	// "Join the community", beside the conversation you'd be joining: a few
	// messages from different people, each a dot and the lines of what they
	// said in a thin bubble, arriving one after another.
	const messages = [
		{ palette: 1, lines: [11, 7] },
		{ palette: 6, lines: [8] },
		{ palette: 3, lines: [12, 9, 5] }
	];

	let shown = $state(false);
</script>

<section class="join">
	<div class="thread" class:shown aria-hidden="true" {@attach inView((v) => v && (shown = true), 0.5)}>
		{#each messages as message, i (i)}
			<div class="message" style:--i={i}>
				<span class="avatar palette-{message.palette}"></span>
				<span class="bubble">
					{#each message.lines as width, j (j)}
						<span class="line" style:width="{width}em"></span>
					{/each}
				</span>
			</div>
		{/each}
	</div>

	<ShowcaseText title={m.join_community()} description={m.join_community_subtitle()}>
		<ShowcaseButton
			href="https://join.slack.com/t/fuiz/shared_invite/zt-2enihgtpy-C1KxJ96pEQN707msi~vNRg"
			icon={Forum}
			label={m.join_slack()}
			palette="slack"
		/>
	</ShowcaseText>
</section>

<style>
	.join {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
		gap: 3em;
		max-width: 64em;
		margin: auto;
		padding: 5em 1.5em;
	}

	@media (width <= 50em) {
		.join {
			grid-template-columns: minmax(0, 1fr);
			padding-block: 4em;
		}

		/* Stacked, the words come first, as in every other section. */
		.thread {
			order: 1;
		}
	}

	.thread {
		display: grid;
		gap: 1em;
		justify-self: center;
		font-size: min(1em, 3.4vw);
	}

	.message {
		display: flex;
		align-items: flex-start;
		gap: 0.7em;
		opacity: 0;
		translate: 0 0.6em;
		transition:
			opacity 400ms ease-out calc(300ms + var(--i) * 700ms),
			translate 500ms cubic-bezier(0.34, 1.56, 0.64, 1) calc(300ms + var(--i) * 700ms);
	}

	.shown .message {
		opacity: 1;
		translate: 0 0;
	}

	.avatar {
		flex: none;
		width: 2em;
		height: 2em;
		border-radius: 50%;
		background: var(--btn-bg);
	}

	.bubble {
		display: grid;
		gap: 0.45em;
		padding: 0.8em 1em;
		border: 2px solid color-mix(in srgb, var(--on-surface) 28%, transparent);
		border-radius: 0.3em 1em 1em 1em;
	}

	.line {
		height: 0.42em;
		border-radius: 1em;
		background: color-mix(in srgb, var(--on-surface) 55%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.message {
			opacity: 1;
			translate: 0 0;
			transition: none;
		}
	}
</style>
