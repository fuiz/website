<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import FuizIcon from '~icons/custom/icon';

	let exitDialog = $state<ConfirmationDialog>();
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
	style:font-family="var(--alternative-font)"
	style:background="var(--on-surface)"
	style:color="var(--surface)"
	style:border="none"
	style:border-radius="100px"
>
	<FuizIcon height="1em" width="1em" title={m.exit()} />
	<!-- i18n-ignore -->
	<div>fuiz</div>
</button>

<ConfirmationDialog
	bind:this={exitDialog}
	title={m.end_fuiz()}
	message=""
	confirmText={m.end()}
	onConfirm={() => goto(resolve(localizeHref('/create')))}
/>
