<script lang="ts">
	let {
		checked = $bindable(),
		id,
		stuck = undefined,
		children,
		onchange
	}: {
		checked: boolean;
		id: string;
		stuck?: boolean | undefined;
		children?: import('svelte').Snippet;
		onchange?: (boolean: boolean) => void;
	} = $props();

	const onInput: import('svelte/elements').FormEventHandler<HTMLInputElement> = (e) => {
		if (stuck === undefined) {
			/* @ts-expect-error target will be HTMLInputElement, the type system doesn't know */
			const target: HTMLInputElement | null = e?.target ?? null;
			checked = target?.checked ?? checked;
			onchange?.(checked);
		}
	};
</script>

<div id="group" data-checked={checked}>
	<input
		{id}
		type="checkbox"
		role="switch"
		{checked}
		disabled={stuck !== undefined}
		oninput={onInput}
	/>
	<label for={id}>{@render children?.()}</label>
	<button
		onclick={() => {
			if (stuck === undefined) {
				checked = !checked;
				onchange?.(checked);
			}
		}}
		aria-labelledby={id}
		type="button"
	>
		<div id="knob-container">
			<div id="start"></div>
			<div id="middle">
				<div id="middle-color">
					<div class="align">
						<div id="knob"></div>
					</div>
				</div>
			</div>
			<div id="end"></div>
		</div>
	</button>
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

	input {
		display: none;
	}

	input:disabled + * + button {
		--accent-color: color-mix(in srgb, currentColor 50%, transparent);
	}

	input:disabled + label {
		opacity: 0.5;
	}

	button {
		appearance: none;
		background: none;
		cursor: pointer;
		margin: 0;
		padding: 0;
		font: inherit;
		color: inherit;
		border: none;
		padding: 0.1em;
		border: 0.1em solid currentColor;
		box-sizing: content-box;

		display: inline-flex;
		height: 0.8em;
		width: 1.6em;
		border-radius: 2em;
	}

	#knob-container {
		border-radius: 1em;
		background-size: 0%;
		flex: 1;
		display: flex;
		height: 100%;
	}

	#knob {
		display: block;
		position: absolute;
		border: 0.15em solid;
		box-sizing: border-box;
		background: var(--palette-light);
		height: 100%;
		aspect-ratio: 1/1;
		border-radius: 100%;
		width: min-content;
	}

	#start {
		aspect-ratio: 1 / 2;
		border-start-start-radius: 1em;
		border-end-start-radius: 1em;
		background: var(--accent-color);
	}

	#end {
		aspect-ratio: 1 / 2;
	}

	#middle {
		flex: 1;
		display: flex;
	}

	#middle-color {
		background: var(--accent-color);
		transition: width 150ms ease-out;
		width: 0%;
		display: flex;
		justify-content: end;
	}

	.align {
		position: relative;
		display: flex;
		justify-content: center;
	}

	[data-checked='true'] #middle-color {
		width: 100%;
	}
</style>
