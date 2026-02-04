<script>
	/** @type {{id: string;value: number;min: number;max: number;children?: import('svelte').Snippet;onchange?: (value: number) => void;}} */
	let { id, value = $bindable(), min, max, children, onchange } = $props();
</script>

<div id="group">
	<label for={id}>{@render children?.()}</label>
	<div id="input-container">
		<input
			{id}
			type="range"
			bind:value
			{min}
			{max}
			step={1}
			onchange={() => {
				onchange?.(value);
			}}
		/>
		<div id="value">
			{value}
		</div>
	</div>
</div>

<style>
	#group {
		display: flex;
		align-items: top;
	}

	label {
		flex: 1;
		padding-inline-end: 0.5em;
	}

	#input-container {
		width: min-content;
		display: flex;
		gap: 0.5em;
		align-items: center;
	}

	input {
		appearance: none;
		height: 0.5em;
		font-size: inherit;
		background: none;
		min-width: 4em;
		padding: 0;
		margin: 0;
		color: inherit;
		width: 100%;
	}

	#value {
		min-width: 1ch;
	}

	input::-moz-range-track {
		background: currentColor;
		height: 0.15em;
	}

	input::-moz-range-thumb {
		border: 0.15em solid currentColor;
		height: 0.75em;
		width: 0.75em;
		border-radius: 1em;
		background: var(--palette-light);
	}

	input[type='range']::-webkit-slider-runnable-track {
		background: currentColor;
		font-size: inherit;
		height: 0.15em;
	}

	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		font-size: inherit;
		border: 0.15em solid currentColor;
		box-sizing: content-box;
		height: 0.75em;
		width: 0.75em;
		border-radius: 0.75em;
		background: var(--palette-light);
		margin-top: -0.4em;
	}
</style>
