<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import AssignmentTurnedIn from '~icons/material-symbols/assignment-turned-in';

	let { answeredCount }: { answeredCount: number } = $props();
</script>

<div
	style:z-index="1"
	style:padding="0.2em 0.6em"
	style:display="flex"
	style:gap="0.3em"
	style:align-items="center"
	style:background="var(--background-color)"
	style:border="0.15em solid"
	style:border-radius="200px"
	title={m.answered_count()}
>
	<AssignmentTurnedIn height="1.2em" title={m.answered_count()} />
	<div style:font-size="1em" style:font-family="Poppins">
		{answeredCount}
	</div>
</div>
