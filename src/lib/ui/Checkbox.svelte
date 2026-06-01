<script lang="ts">
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages.js';
	import Check from '~icons/custom/check';
	import Close from '~icons/custom/close';

	let {
		value = $bindable(),
		color = undefined,
		attention = false
	}: {
		value: boolean;
		color?: string;
		attention?: boolean;
	} = $props();

	const duration = 150;
</script>

<button
	class="root"
	role="checkbox"
	aria-checked={value}
	style:--fill={color ?? 'var(--btn-bg, var(--primary))'}
	onclick={() => (value = !value)}
>
	<div class="box">
		{#if value}
			<div
				class="fill"
				in:scale={{ easing: backOut, duration: duration, delay: duration }}
				out:scale={{ easing: backOut, duration: duration }}
			>
				<Check height="100%" title={m.marked_as_correct()} />
			</div>
		{:else}
			<div
				class="fill"
				class:attention
				in:scale={{ easing: backOut, duration: duration, delay: duration }}
				out:scale={{ easing: backOut, duration: duration }}
			>
				<Close height="100%" title={m.marked_as_wrong()} />
			</div>
		{/if}
	</div>
</button>

<style>
	.root {
		height: 100%;
		aspect-ratio: 1 / 1;
		padding: 0;
		background: transparent;
		width: auto;
		box-sizing: border-box;
		font: inherit;
		color: var(--palette-light);
		border: none;
	}

	.box {
		height: 100%;
		width: auto;
		aspect-ratio: 1 / 1;
		background: var(--fill);
		transition: background 300ms linear;
		border: 0.2em solid currentcolor;
		border-radius: 0.5em;
		box-sizing: border-box;
	}

	.fill {
		height: 100%;
	}

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
