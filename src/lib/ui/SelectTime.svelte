<script>
	import FancyButton from './FancyButton.svelte';

	/** @type {{options: string[] | number[];selected: string | number;map?: (a: string) => string;children?: import('svelte').Snippet;}} */
	let { options, selected = $bindable(), map = (a) => a, children } = $props();

	/** @type {HTMLDialogElement | undefined} */
	let dialog = $state();
</script>

<FancyButton onclick={() => dialog?.showModal()}>
	<div style:display="flex" style:align-items="center" style:justify-content="center">
		{@render children?.()}
		<div style:padding="0 5px" style:text-transform="capitalize">
			{map(selected.toString())}
		</div>
	</div>
</FancyButton>

<dialog bind:this={dialog}>
	<div id="container">
		<ul>
			{#each options as value (value)}
				<li>
					<FancyButton
						onclick={() => {
							selected = value;
							dialog?.close();
						}}
					>
						<div style:padding="0.25em 0.5em" style:text-transform="capitalize">
							{map(value.toString())}
						</div>
					</FancyButton>
				</li>
			{/each}
		</ul>
	</div>
</dialog>

<style>
	#container {
		position: fixed;
		z-index: 1;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: color-mix(in srgb, var(--background-color) 80%, transparent);
		backdrop-filter: blur(4px);

		display: flex;
		align-items: center;
		justify-content: center;

		& ul {
			margin: 0;
			padding: 10px;
			display: grid;
			grid-gap: 10px;
			font-size: max(4vmin, 0.8em);
			grid-template-columns: repeat(auto-fit, minmax(12ch, 1fr));
			max-width: min(80vw, 50ch);
			flex-wrap: wrap;

			& li {
				display: block;
			}
		}
	}
</style>
