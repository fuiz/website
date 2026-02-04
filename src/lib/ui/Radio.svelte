<script>
	/** @type {{
	 * options: { value: string; label: string }[];
	 * label: string;
	 * value: string;
	 * onchange?: (value: string) => void;
	}}*/
	let { options, label, value = $bindable(), onchange } = $props();

	/** @type {import('svelte/elements').ChangeEventHandler<HTMLInputElement>} */
	const onChange = (e) => {
		/** @type {HTMLInputElement | undefined} */
		// @ts-ignore
		const target = e?.target;
		value = target?.value ?? value;
		onchange?.(value);
	};
</script>

<div class="radio-group">
	{#each options as option}
		<label>
			<input
				type="radio"
				name={label}
				checked={value === option.value}
				onchange={onChange}
				value={option.value}
			/>
			{option.label}
		</label>
	{/each}
</div>

<style>
	.radio-group {
		display: flex;
		gap: 0.1rem;
		margin: 0.1rem 0;
		align-items: center;
		padding: 0.1rem;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	label:hover {
		background-color: var(--hover-bg);
	}

	input[type='radio'] {
		width: 4.2rem;
		height: 1.2rem;
		accent-color: var(--accent);
		cursor: pointer;
		margin: 0;
	}

	input[type='radio']:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
</style>
