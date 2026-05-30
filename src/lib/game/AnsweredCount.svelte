<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import GroupsOutline from '~icons/material-symbols/groups-outline';

	let { answeredCount }: { answeredCount: number } = $props();
</script>

<div class="container" title={m.answered_count()}>
	<GroupsOutline height="1.2em" title={m.answered_count()} />
	<div class="count">{answeredCount}</div>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		gap: 0.3em;
		padding: 0.2em 0.6em;
		background: var(--surface);
		color: var(--on-surface);
		border: 1px solid var(--outline);
		border-radius: 200px;
		font-family: var(--alternative-font);
	}

	.count {
		min-width: 2ch;
		text-align: center;
	}
</style>
