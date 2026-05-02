<script lang="ts">
	import { buttonColors, buttonSymbols } from '$lib/clientOnly';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Check from '~icons/custom/check';

	let {
		index,
		selected = false,
		onclick
	}: {
		index: number;
		selected?: boolean;
		onclick?: () => void;
	} = $props();

	let buttonSymbol = $derived(buttonSymbols[index % buttonColors.length]);
</script>

<div class="wrapper">
	<FancyButton
		{onclick}
		backgroundColor={buttonColors.at(index % buttonColors.length)?.at(0)}
		backgroundDeepColor={buttonColors.at(index % buttonColors.length)?.at(1)}
		height="100%"
	>
		<div class="content">
			<div class="icon">
				<buttonSymbol.icon title={buttonSymbol.label} height="100%" width="100%" />
			</div>
		</div>
	</FancyButton>
	{#if selected}
		<div
			class="badge"
			style:background={buttonColors.at(index % buttonColors.length)?.at(0)}
			style:border-color={buttonColors.at(index % buttonColors.length)?.at(1)}
		>
			<Check height="100%" width="100%" />
		</div>
	{/if}
</div>

<style>
	.wrapper {
		position: relative;
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

	.badge {
		position: absolute;
		top: -0.4em;
		inset-inline-end: -0.4em;
		height: 2em;
		width: 2em;
		border-radius: 50%;
		border: 0.1em solid;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0em;
		box-sizing: border-box;
		pointer-events: none;
	}
</style>
