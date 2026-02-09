<script>
	import correct_penguin from '$lib/assets/visuals/correct_penguin.svg';
	import wrong_penguin from '$lib/assets/visuals/wrong_penguin.svg';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import Topbar from './Topbar.svelte';

	/** @type {{name: string;score: number;isWinner: boolean;winners: string[];}} */
	let { name, score, isWinner, winners } = $props();

	const formatter = new Intl.ListFormat(getLocale(), { style: 'long', type: 'conjunction' });
</script>

<div style:height="100%" style:display="flex" style:flex-direction="column">
	<Topbar {name} {score} />
	<div style:flex="1">
		<NiceBackground>
			<div
				style:height="100%"
				style:display="flex"
				style:justify-content="center"
				style:align-items="center"
			>
				<div
					style:display="flex"
					style:flex-direction="column"
					style:padding="0.4em"
					style:align-items="center"
				>
					<img
						style:width="10em"
						src={isWinner ? correct_penguin : wrong_penguin}
						alt={isWinner ? m.penguin_checkmark() : m.penguin_crossmark()}
					/>
					<div style:font-weight="bold" style:max-width="20ch" style:text-align="center">
						{#if isWinner}
							{m.congrats()}
							{m.list_won({
								winners: formatter.format(['You'].concat(winners.filter((x) => x !== name)))
							})}
						{:else}
							{m.try_again()}
							{m.list_won({
								winners: formatter.format(winners)
							})}
						{/if}
					</div>
				</div>
			</div>
		</NiceBackground>
	</div>
</div>
