<script lang="ts">
	import AnsweredCount from '$lib/game/AnsweredCount.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';

	let {
		questionText,
		timeLeft = null,
		timeStarted = null,
		answeredCount = undefined
	}: {
		questionText: string;
		timeLeft?: number | null;
		timeStarted?: number | null;
		answeredCount?: number;
	} = $props();
</script>

<div class="header">
	<div class="control">
		{#if timeLeft !== null && timeStarted !== null}
			<TimeLeft {timeLeft} {timeStarted} />
		{/if}
	</div>
	<div class="text-slot">
		<TextBar text={questionText} />
	</div>
	<div class="control">
		{#if answeredCount !== undefined}
			<AnsweredCount {answeredCount} />
		{/if}
	</div>
</div>

<style>
	.header {
		display: flex;
		align-items: center;
		padding: 0 0.4em;
	}

	.text-slot {
		flex: 1;
		min-width: 0;
	}

	.control {
		z-index: 1;
	}
</style>
