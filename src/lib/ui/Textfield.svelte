<script>
	import * as m from '$lib/paraglide/messages.js';

	import Icon from '$lib/media/Icon.svelte';

	/** @type {{
	* id: string;
	* placeholder: string;
	* required: boolean;
	* disabled: boolean;
	* value: string | undefined;
	* textTransform?: string;
	* autocomplete?: import("svelte/elements").FullAutoFill | null | undefined;
	* maxLength?: number | undefined;
	* minLength?: number | undefined;
	* showInvalid?: boolean;
	* inputmode?:
	* 	| 'text'
	* 	| 'search'
	* 	| 'none'
	* 	| 'tel'
	* 	| 'url'
	* 	| 'email'
	* 	| 'numeric'
	* 	| 'decimal'
	* 	| undefined;
	}} */
	let {
		id,
		placeholder,
		required,
		disabled,
		value = $bindable(),
		textTransform = '',
		autocomplete = 'off',
		maxLength = undefined,
		minLength = undefined,
		showInvalid = true,
		inputmode = undefined
	} = $props();
</script>

<div style:position="relative">
	<input
		class={showInvalid ? 'show-invalid' : ''}
		{id}
		name={id}
		{autocomplete}
		type="text"
		style:text-transform={textTransform}
		{required}
		{disabled}
		placeholder=""
		bind:value
		maxlength={maxLength}
		minlength={minLength}
		{inputmode}
	/>
	<label for={id}>{placeholder}</label>
	<div id="error">
		<Icon src="$lib/assets/icons/error.svg" alt={m.length_too_short()} size="1.2em" />
	</div>
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	label {
		text-align: center;
		color: color-mix(in srgb, currentColor 50%, transparent);
		padding: 0 8px;
		position: absolute;
		pointer-events: none;
		border-radius: 5px 5px 0 0;
		top: 50%;
		transform: translateY(-50%);
		line-height: 10px;
		transform-origin: top;
		transition: all 100ms linear;
	}

	input:is(:global(:not(:placeholder-shown), :focus, :active)) + label {
		top: 0;
		scale: 0.75;
		background: var(--background-color);
		transform: translateY(-50%);
	}

	#error {
		display: none;
	}

	input.show-invalid:invalid {
		padding-right: 1.8em;

		& ~ #error {
			color: var(--accent-color);
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			bottom: 0;
			top: 0;
			right: 0.4em;
		}
	}

	input:focus + label {
		color: var(--accent-color);
	}

	input {
		background: none;
		border: 2px solid #a9a8aa;
		border-radius: 10px;
		width: 100%;
		color: inherit;
		box-sizing: border-box;
		font: inherit;
		box-sizing: border-box;
		text-align: center;
		padding: 8px 5px;
		resize: none;
		transition: border-color 100ms linear;
	}

	input:focus {
		outline: none;
		border-color: var(--accent-color);
	}
</style>
