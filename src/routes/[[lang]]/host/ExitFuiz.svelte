<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import FuizIcon from '~icons/custom/icon';
	import { goto } from '$app/navigation';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';

	let exitDialog: ConfirmationDialog | undefined = $state();
</script>

<button
	onclick={() => exitDialog?.open()}
	style:cursor="pointer"
	style:appearance="none"
	style:display="flex"
	style:padding="0.2em 0.4em"
	style:gap="2px"
	style:align-items="center"
	style:line-height="1em"
	style:font-size="inherit"
	style:font-family="Poppins"
	style:background="var(--color)"
	style:color="var(--background-color)"
	style:border="none"
	style:border-radius="100px"
>
	<FuizIcon height="1em" width="1em" title={m.exit()} />
	<div>fuiz</div>
</button>

<ConfirmationDialog
	bind:this={exitDialog}
	title={m.end_fuiz()}
	message=""
	confirmText={m.end()}
	onConfirm={() => goto('create')}
/>
