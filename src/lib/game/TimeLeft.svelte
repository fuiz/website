<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import Hourglass from '~icons/material-symbols/hourglass';
	import HourglassEmpty from '~icons/material-symbols/hourglass-empty';

	let { timeLeft, timeStarted }: { timeLeft: number; timeStarted: number } = $props();

	let maxDigits = $derived(String(Math.ceil(timeStarted / 1000)).length);
</script>

<div class="container" class:flashing={timeLeft <= 5000}>
	<div class="hourglass">
		<div class="layer top-filled">
			<Hourglass height="1.2em" title={m.filled_hourglass()} />
		</div>
		<div
			class="layer top-empty"
			style:height="{(-(timeStarted - timeLeft) / timeStarted) * 30 + 85}%"
		>
			<HourglassEmpty height="1.2em" title={m.empty_hourglass()} />
		</div>
		<div class="layer bottom-filled">
			<Hourglass height="1.2em" title={m.filled_hourglass()} />
		</div>
		<div
			class="layer bottom-empty"
			style:height="{((timeStarted - timeLeft) / timeStarted) * 30 + 15}%"
		>
			<HourglassEmpty height="1.2em" title={m.empty_hourglass()} />
		</div>
	</div>
	<div class="count" style:min-width="{maxDigits}ch">
		{Math.ceil(timeLeft / 1000)}
	</div>
</div>

<style>
	.container {
		display: flex;
		padding: 0.2em 0.6em;
		gap: 0.3em;
		align-items: center;
		font-family: var(--alternative-font);
		border-radius: 200px;
		overflow: hidden;
		background: var(--on-surface);
		color: var(--surface);
		border: 0.15em solid var(--on-surface);
	}

	.container.flashing {
		animation: 500ms steps(1) 0s infinite alternate flash;
	}

	.hourglass {
		position: relative;
		width: 1.2em;
		height: 1.2em;
		background: inherit;
	}

	.layer {
		position: absolute;
		overflow: hidden;
	}

	.top-filled {
		height: 100%;
	}

	.top-empty,
	.bottom-empty {
		background: inherit;
	}

	.bottom-filled {
		height: 50%;
	}

	.count {
		text-align: center;
	}

	@keyframes flash {
		0% {
			background: var(--palette-dark);
			color: var(--palette-light);
		}

		50% {
			background: var(--palette-light);
			color: var(--palette-dark);
		}
	}
</style>
