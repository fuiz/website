<script lang="ts">
	import waiting_penguin from '$lib/assets/visuals/waiting.svg';

	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import Topbar from './Topbar.svelte';

	let {
		name
	}: {
		name: string;
	} = $props();
</script>

<div class="page">
	<Topbar {name} />
	<div class="body">
		<NiceBackground>
			<div class="center">
				<div class="content">
					<img class="penguin" src={waiting_penguin} alt={m.penguin_waiting()} />
					<div class="caption">
						{m.waiting_host()}
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
	}

	.penguin {
		width: 10em;
	}

	.caption {
		font-weight: bold;
		max-width: 10ch;
		text-align: center;
	}
</style>
