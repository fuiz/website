<script lang="ts">
	import type { Snippet } from 'svelte';
	import FancyButton from './FancyButton.svelte';

	let {
		options,
		selected = $bindable(),
		map = (a) => a,
		children
	}: {
		options: (string | number | null)[];
		selected: string | number | null | undefined;
		map?: (a: string) => string;
		children?: Snippet;
	} = $props();

	let dialog = $state<HTMLDialogElement>();
</script>

<FancyButton onclick={() => dialog?.showModal()}>
	<div class="trigger">
		{@render children?.()}
		<div class="trigger-label">
			{map(String(selected ?? ''))}
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
						<div class="option-label">
							{map(String(value ?? ''))}
						</div>
					</FancyButton>
				</li>
			{/each}
		</ul>
	</div>
</dialog>

<style>
	.trigger {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.trigger-label {
		padding: 0 5px;
		text-transform: capitalize;
	}

	.option-label {
		padding: 0.25em 0.5em;
		text-transform: capitalize;
	}

	#container {
		position: fixed;
		z-index: 1;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: color-mix(in srgb, var(--surface) 80%, transparent);
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
