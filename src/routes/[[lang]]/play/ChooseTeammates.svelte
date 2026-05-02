<script lang="ts">
	import PlayersList from '$lib/game/PlayersList.svelte';

	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import Topbar from './Topbar.svelte';

	let {
		name,
		available = $bindable(),
		max,
		onchoose
	}: {
		name: string;
		available: [string, boolean][];
		max: number;
		onchoose: (players: string[]) => void;
	} = $props();
</script>

<div class="page">
	<Topbar {name} />
	<div class="body">
		<NiceBackground>
			<div class="center">
				<div class="content">
					<div class="title">
						{m.choose_teammates()}
					</div>
					<div>{m.choose_teammates_desc()}</div>
					<div class="list">
						<PlayersList
							bind:players={available}
							exactCount={available.length}
							{max}
							selectable={true}
							{onchoose}
						/>
					</div>
				</div>
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	.page {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.body {
		flex: 1;
	}

	.center {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.title {
		font-weight: bold;
		font-family: var(--alternative-font);
		font-size: 1.5em;
		max-width: 10ch;
		text-align: center;
	}

	.list {
		display: flex;
		gap: 0.5em;
		flex-wrap: wrap;
		padding: 1em;
		justify-content: center;
	}
</style>
