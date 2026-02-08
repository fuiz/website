<script>
	import * as m from '$lib/paraglide/messages.js';

	import Check from '~icons/material-symbols/check';
	import Close from '~icons/material-symbols/close';
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	/** @type {{
	 *  value: boolean;
	 *  color?: string | undefined;
	 *  attention?: boolean;
	}} */
	let { value = $bindable(), color = undefined, attention = false } = $props();

	const duration = 150;
</script>

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
				<Check height="100%" title={m.marked_as_correct()} />
			</div>
		{:else}
			<div
				in:scale={{ easing: backOut, duration: duration, delay: duration }}
				class={attention ? 'attention' : ''}
				out:scale={{ easing: backOut, duration: duration }}
			>
				<Close height="100%" title={m.marked_as_wrong()} />
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
