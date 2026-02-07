<script>
	import * as m from '$lib/paraglide/messages.js';

	import factual from '$lib/assets/icons/correct.svg';
	import wrong from '$lib/assets/icons/wrong.svg';
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import Icon from '$lib/media/Icon.svelte';

	/** @type {{
	 *  value: boolean;
	 *  color?: string | undefined;
	 *  attention?: boolean;
	}} */
	let { value = $bindable(), color = undefined, attention = false } = $props();

	const duration = 150;
</script>

<svelte:head>
	<link rel="prefetch" as="image" href={factual} />
	<link rel="prefetch" as="image" href={wrong} />
</svelte:head>

<button
	style:height="100%"
	style:aspect-ratio="1/1"
	style:padding="0"
	style:background="transparent"
	style:width="auto"
	style:box-sizing="border-box"
	role="checkbox"
	aria-checked={value}
	style:font="inherit"
	style:color="var(--palette-light)"
	style:border="none"
	onclick={() => (value = !value)}
>
	<div
		style:height="100%"
		style:width="auto"
		style:aspect-ratio="1/1"
		style:background={color ?? 'var(--accent-color)'}
		style:transition="background 300ms linear"
		style:border="0.2em solid currentcolor"
		style:border-radius="0.5em"
		style:box-sizing="border-box"
	>
		{#if value}
			<div
				in:scale={{ easing: backOut, duration: duration, delay: duration }}
				out:scale={{ easing: backOut, duration: duration }}
			>
				<Icon src={factual} alt={m.marked_as_correct()} size="100%" />
			</div>
		{:else}
			<div
				in:scale={{ easing: backOut, duration: duration, delay: duration }}
				class={attention ? 'attention' : ''}
				out:scale={{ easing: backOut, duration: duration }}
			>
				<Icon src={wrong} alt={m.marked_as_wrong()} size="100%" />
			</div>
		{/if}
	</div>
</button>

<style>
	.attention {
		animation: heartbeat 600ms ease-in-out infinite alternate;
	}

	@keyframes heartbeat {
		50% {
			transform: scale(1);
		}

		to {
			transform: scale(0.5);
		}
	}
</style>
