<script lang="ts">
	import { buttonSymbols } from '$lib/clientOnly';
	import FancyButton from '$lib/ui/FancyButton.svelte';

	let {
		index,
		onclick
	}: {
		index: number;
		onclick?: () => void;
	} = $props();

	let buttonSymbol = $derived(buttonSymbols[index % buttonSymbols.length]);
</script>

<div class="wrapper">
	<FancyButton {onclick} palette={index} height="100%">
		<div class="content">
			<div class="icon">
				<buttonSymbol.icon title={buttonSymbol.label} height="100%" width="100%" />
			</div>
		</div>
	</FancyButton>
</div>

<style>
	.wrapper {
		min-height: 0;
		box-sizing: border-box;
	}

	.content {
		height: 100%;
		width: 100%;
		min-height: 1.5em;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.icon {
		aspect-ratio: 1;
		max-height: 65%;
		max-width: 65%;
		display: flex;
		align-items: center;
		height: 100%;
		box-sizing: border-box;
	}
</style>
