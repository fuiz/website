<script>
	import * as m from '$lib/paraglide/messages.js';

	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import waiting_penguin from '$lib/assets/visuals/waiting.svg';
	import Topbar from './Topbar.svelte';

	/** @type {{name: string;gameCode: string;}} */
	let { name, gameCode } = $props();
</script>

<div style:height="100%" style:display="flex" style:flex-direction="column">
	<Topbar {name} />
	<div style:flex="1">
		<NiceBackground>
			<div
				style:height="100%"
				style:display="flex"
				style:justify-content="center"
				style:align-items="center"
			>
				<div style:display="flex" style:flex-direction="column" style:align-items="center">
					<img style:width="10em" src={waiting_penguin} alt={m.penguin_waiting()} />
					<div style:font-weight="bold" style:max-width="10ch" style:text-align="center">
						{m.waiting_host()}
					</div>
				</div>
			</div>
		</NiceBackground>
	</div>
	<div
		style:background="var(--background-color)"
		style:text-align="center"
		style:padding="5px 0"
		style:border-top="0.15em solid"
	>
		<div style:font-weight="bold">{m.game_code()}</div>
		<div style:font-size="2em" style:font-family="Poppins" style:text-transform="uppercase">
			{gameCode}
		</div>
	</div>
</div>
