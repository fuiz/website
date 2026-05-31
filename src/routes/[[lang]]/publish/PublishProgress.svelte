<script lang="ts">
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import CheckCircleOutline from '~icons/material-symbols/check-circle-outline';
	import type { PublishingState } from '../../api/library/publish-stream/types';

	let { state }: { state: PublishingState } = $props();

	const steps: { state: PublishingState; label: string }[] = [
		{ state: 'generating-keywords', label: 'Generating keywords' },
		{ state: 'forking', label: 'Forking repository' },
		{ state: 'creating-branch', label: 'Creating branch' },
		{ state: 'uploading', label: 'Uploading files' },
		{ state: 'creating-pr', label: 'Creating pull request' }
	];

	let activeIndex = $derived(steps.findIndex((s) => s.state === state));
</script>

<div class="wrap">
	<ol class="timeline">
		{#each steps as step, i (step.state)}
			<li class="step" class:done={i < activeIndex} class:active={i === activeIndex}>
				<div class="marker">
					{#if i < activeIndex}
						<CheckCircleOutline height="1.1em" width="1.1em" />
					{:else if i === activeIndex}
						<div class="spinner"><LoadingCircle borderWidth={5} /></div>
					{:else}
						<div class="dot"></div>
					{/if}
				</div>
				<div class="label">{step.label}</div>
			</li>
		{/each}
	</ol>
</div>

<style>
	.wrap {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.timeline {
		list-style: none;
		margin: 0 auto;
		padding: 0;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 32ch;
	}

	.step {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.75em;
		padding-bottom: 0.9em;
		min-height: 1.6em;
	}

	.step:not(:last-child)::after {
		content: '';
		position: absolute;
		left: 0.5em;
		top: 1.45em;
		bottom: -0.15em;
		width: 2px;
		background: color-mix(in srgb, var(--on-surface) 15%, transparent);
		border-radius: 999px;
	}

	.step.done:not(:last-child)::after {
		background: var(--primary);
	}

	.marker {
		position: relative;
		z-index: 1;
		flex-shrink: 0;
		width: 1.1em;
		height: 1.1em;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--primary);
	}

	.dot {
		width: 1.1em;
		height: 1.1em;
		border-radius: 999px;
		background: var(--surface);
		border: 2px solid color-mix(in srgb, var(--on-surface) 25%, transparent);
		box-sizing: border-box;
	}

	.spinner {
		width: 1.1em;
		height: 1.1em;
	}

	.label {
		font-size: 0.95em;
		line-height: 1.3;
		padding-top: 0.05em;
		opacity: 0.55;
	}

	.step.done .label {
		opacity: 0.75;
	}

	.step.active .label {
		font-weight: 700;
		opacity: 1;
	}
</style>
