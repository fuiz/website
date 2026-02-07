<script>
	import * as m from '$lib/paraglide/messages.js';

	import warning from '$lib/assets/icons/warning.svg';
	import Message from './Message.svelte';

	/** @type {{ errorMessage: string }}*/
	let { errorMessage } = $props();
</script>

<Message
	message={errorMessage}
	background="#e01b2430"
	color="#e01b24"
	image={{ src: warning, alt: m.error_alt() }}
/>
