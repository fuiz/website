<script>
	import * as m from '$lib/paraglide/messages.js';

	import Icon from '$lib/media/Icon.svelte';
	import assignmentTurned from '$lib/assets/answer_turned.svg';

	/** @type {{answeredCount: number}} */
	let { answeredCount } = $props();
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
>
	<Icon src={assignmentTurned} alt={m.answered_count()} size="1.2em" />
	<div style:font-size="1em" style:font-family="Poppins">
		{answeredCount}
	</div>
</div>
