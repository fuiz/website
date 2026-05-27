<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import FuizIcon from '~icons/custom/icon';

	let exitDialog = $state<ConfirmationDialog>();
</script>

<button class="exit-fuiz" onclick={() => exitDialog?.open()}>
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

<style>
	.exit-fuiz {
		cursor: pointer;
		appearance: none;
		display: flex;
		padding: 0.3em 0.4em;
		gap: 2px;
		align-items: center;
		line-height: 1em;
		font-size: inherit;
		font-family: var(--alternative-font);
		background: var(--on-surface);
		color: var(--surface);
		border: none;
		border-radius: 100px;
	}
</style>
