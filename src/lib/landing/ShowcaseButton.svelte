<script lang="ts">
	import type { Component } from 'svelte';
	import type { Palette } from '$lib/clientOnly';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';

	/** A call to action under a landing-page scene: an icon and a label. */
	let {
		href,
		icon: Icon,
		label,
		palette
	}: {
		href: string;
		icon: Component<{ height?: string; title?: string }>;
		label: string;
		palette?: Palette;
	} = $props();
</script>

<FancyAnchorButton {href} {palette}>
	<span class="inner">
		<Icon height="1.2em" title={label} />
		{label}
	</span>
</FancyAnchorButton>

<style>
	.inner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
		padding: 0.35em 1.1em;
		font-family: var(--alternative-font);
		white-space: nowrap;
	}
</style>
