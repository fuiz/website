<script lang="ts">
	interface Props {
		value: string;
		placeholder: string;
		textAlign?: string;
		lightText?: boolean;
		padding?: string;
		maxLength?: number | undefined;
	}

	let {
		value = $bindable(),
		placeholder,
		textAlign = 'center',
		lightText = false,
		padding = '5px',
		maxLength = undefined
	}: Props = $props();

	let placeholderColor = $derived(lightText ? '#FFFFFF80' : '#00000080');

	let editableElement: HTMLTextAreaElement | undefined = $state();

	$effect(() => {
		if (!editableElement) return;
		editableElement.style.height = '0';
		editableElement.style.height = (editableElement.scrollHeight + 4).toString() + 'px';
	});
</script>

<textarea
	bind:this={editableElement}
	{value}
	oninput={(e) => {
		const target: EventTarget | undefined = e?.target ?? undefined;
		const inputtedValue = (target as HTMLTextAreaElement | null)?.value;
		value = inputtedValue?.replaceAll('\n', '').replaceAll('\r', '') ?? value;
	}}
	style:background="none"
	style:color="inherit"
	style:display="flex"
	style:font="inherit"
	style:width="100%"
	style:padding
	style:text-align={textAlign}
	{placeholder}
	style:box-sizing="border-box"
	style:word-wrap="anywhere"
	style:border="none"
	style:resize="none"
	style:margin="0"
	style:outline="none"
	style:height="100%"
	style="--placeholderColor: {placeholderColor}"
	rows="1"
	maxlength={maxLength}
></textarea>

<style>
	textarea::placeholder {
		color: var(--placeholderColor);
	}
</style>
