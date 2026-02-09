<script>
	import * as m from '$lib/paraglide/messages.js';

	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import answered_penguin from '$lib/assets/visuals/answered_penguin.svg';
	import Topbar from './Topbar.svelte';

	/** @type {{name: string;score: number;}} */
	let { name, score } = $props();
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
				<div style:display="flex" style:flex-direction="column" style:align-items="center">
					<img style:width="10em" src={answered_penguin} alt={m.two_penguins()} />
					<div style:font-weight="bold" style:max-width="10ch" style:text-align="center">
						{m.waiting_players()}
					</div>
				</div>
			</div>
		</NiceBackground>
	</div>
</div>
