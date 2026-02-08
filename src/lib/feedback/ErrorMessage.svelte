<script>
	import * as m from '$lib/paraglide/messages.js';

	import WarningOutlineRounded from '~icons/material-symbols/warning-outline-rounded';
	import Message from './Message.svelte';

	/** @type {{ errorMessage: string }}*/
	let { errorMessage } = $props();
</script>

<Message message={errorMessage} background="#e01b2430" color="#e01b24">
	{#snippet icon()}
		<WarningOutlineRounded height="1.2em" title={m.error_alt()} />
	{/snippet}
</Message>
