<script lang="ts">
	let {
		value = $bindable(),
		placeholder,
		textAlign = 'center',
		lightText = false,
		padding = '5px',
		maxLength = undefined
	}: {
		value: string;
		placeholder: string;
		textAlign?: string;
		lightText?: boolean;
		padding?: string;
		maxLength?: number;
	} = $props();

	let placeholderColor = $derived(lightText ? '#FFFFFF80' : '#00000080');

	let editableElement = $state<HTMLTextAreaElement>();

	$effect(() => {
		if (!editableElement) return;
		editableElement.style.height = '0';
		editableElement.style.height = (editableElement.scrollHeight + 4).toString() + 'px';
	});

	const onInput: import('svelte/elements').FormEventHandler<HTMLTextAreaElement> = (e) => {
		/* @ts-expect-error target will be HTMLTextAreaElement, the type system doesn't know */
		const target: HTMLTextAreaElement | null = e?.target ?? null;
		const inputtedValue = target?.value;
		value = inputtedValue?.replaceAll('\n', '').replaceAll('\r', '') ?? value;
	};
</script>

<textarea
	bind:this={editableElement}
	{value}
	oninput={onInput}
	class="root"
	style:--pad={padding}
	style:--text-align={textAlign}
	style:--placeholder-color={placeholderColor}
	{placeholder}
	rows="1"
	maxlength={maxLength}
></textarea>

<style>
	.root {
		background: none;
		color: inherit;
		display: flex;
		font: inherit;
		width: 100%;
		height: 100%;
		padding: var(--pad);
		text-align: var(--text-align);
		box-sizing: border-box;
		word-wrap: anywhere;
		border: none;
		resize: none;
		margin: 0;
		outline: none;
	}

	.root::placeholder {
		color: var(--placeholder-color);
	}
</style>
