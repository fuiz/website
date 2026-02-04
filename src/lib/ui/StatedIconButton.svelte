<script>
	import IconButton from './IconButton.svelte';

	/** @type {{
	 * 	icons: [{ src: string; alt: string }, { src: string; alt: string }],
	 * 	size: string,
	 * 	state: boolean,
	 * 	onchange?: (state: boolean) => void
	 * }}*/
	let { icons, size, state = $bindable(), onchange } = $props();

	let icon = $derived(icons[state ? 1 : 0]);
</script>

<IconButton
	src={icon.src}
	alt={icon.alt}
	{size}
	onclick={() => {
		state = !state;
		if (onchange) onchange(state);
	}}
/>
