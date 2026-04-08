<script lang="ts">
	import IconButton from './IconButton.svelte';

	let {
		icons,
		size = undefined,
		state = $bindable(),
		onchange
	}: {
		icons: [
			{ component: import('svelte').Component; alt: string },
			{ component: import('svelte').Component; alt: string }
		];
		size?: string;
		state: boolean;
		onchange?: (state: boolean) => void;
	} = $props();

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
