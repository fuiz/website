<script>
	import { scale } from 'svelte/transition';
	import ErrorMessage from './ErrorMessage.svelte';
	import { backOut } from 'svelte/easing';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';

	/** @type {{ errorMessage: string }}*/
	let { errorMessage } = $props();
</script>

<TypicalPage>
	<div
		style:height="100%"
		style:display="flex"
		style:align-items="center"
		style:max-width="40ch"
		style:margin="auto"
		transition:scale={{ delay: 500, duration: 150, easing: backOut }}
	>
		<div style:margin="auto">
			<ErrorMessage {errorMessage} />
		</div>
	</div>
</TypicalPage>
