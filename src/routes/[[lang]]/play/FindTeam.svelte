<script lang="ts">
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import Topbar from './Topbar.svelte';

	let {
		name,
		teamName
	}: {
		name: string;
		teamName: string;
	} = $props();
</script>

<div class="page">
	<Topbar {name} />
	<div class="body">
		<NiceBackground>
			<div class="center">
				<div class="prompt">
					{m.find_team({ team: teamName })}
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

	.prompt {
		font-weight: bold;
		font-family: var(--alternative-font);
		font-size: 1.75em;
		max-width: 12ch;
		text-align: center;
	}
</style>
