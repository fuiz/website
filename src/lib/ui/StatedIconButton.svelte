<script>
	import IconButton from './IconButton.svelte';

	/** @type {{
	 * 	icons: [{ component: import('svelte').Component, alt: string }, { component: import('svelte').Component, alt: string }],
	 * 	size: string,
	 * 	state: boolean,
	 * 	onchange?: (state: boolean) => void
	 * }}*/
	let { icons, size, state = $bindable(), onchange } = $props();

	let icon = $derived(icons[state ? 1 : 0]);
</script>

<IconButton
	alt={icon.alt}
	onclick={() => {
		state = !state;
		if (onchange) onchange(state);
	}}
>
	{@const Component = icon.component}
	<Component height={size} />
</IconButton>
