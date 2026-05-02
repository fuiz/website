<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';
	import Modal from '$lib/feedback/Modal.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import DarkModeSwitcher from '$lib/ui/DarkModeSwitcher.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import SettingsOutline from '~icons/material-symbols/settings-outline';
	import SportsScore from '~icons/material-symbols/sports-score';

	let {
		name,
		score = undefined
	}: {
		name: string;
		score?: number;
	} = $props();

	let gameCodeGetter = getContext<(() => string) | undefined>('gameCode');
	let gameCode = $derived(gameCodeGetter?.());

	let modal = $state<Modal>();
	let exitDialog = $state<ConfirmationDialog>();
	let dark = $state<boolean>();

	function confirmExit() {
		modal?.close();
		exitDialog?.open();
	}
</script>

<div class="topbar">
	<div class="name">
		{name}
	</div>
	{#if score !== undefined}
		<div class="score">
			<div class="score-value">
				{score}
			</div>
			<SportsScore height="1.25em" title={m.points()} />
		</div>
	{/if}
	<IconButton alt={m.options()} onclick={() => modal?.open()} padding="0.2em">
		<SettingsOutline height="1.25em" />
	</IconButton>
</div>

<Modal bind:this={modal}>
	<div class="dialog-content">
		{#if gameCode}
			<div class="row">
				<div class="label">{m.game_code()}</div>
				<div class="code">{gameCode}</div>
			</div>
		{/if}
		<div class="row">
			<div class="label">{m.language()}</div>
			<LanguageSwitcher id="topbar-settings-lang" up={true} />
		</div>
		<div class="row">
			<div class="label">{dark ? m.switch_light() : m.switch_dark()}</div>
			<DarkModeSwitcher bind:dark />
		</div>
		<FancyButton onclick={confirmExit}>
			<div class="leave-label">{m.exit()}</div>
		</FancyButton>
	</div>
</Modal>

<ConfirmationDialog
	bind:this={exitDialog}
	title={m.end_fuiz()}
	message=""
	confirmText={m.exit()}
	onConfirm={() => goto(resolve(localizeHref('/')))}
/>

<style>
	.topbar {
		display: flex;
		background: var(--surface);
		box-shadow: 0 2px 2px #00000040;
		padding: 0.2em 0.4em;
		align-items: center;
		gap: 0.4em;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
	}

	.name {
		display: flex;
		padding: 0.2em;
		font-family: var(--alternative-font);
		overflow-wrap: anywhere;
		box-sizing: border-box;
		flex: 1;
	}

	.score {
		font-weight: bold;
		display: flex;
		gap: 3px;
		padding: 0.2em;
		box-sizing: border-box;
		align-items: center;
	}

	.score-value {
		font-family: var(--alternative-font);
	}

	.dialog-content {
		display: flex;
		flex-direction: column;
		gap: 0.75em;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5em;
	}

	.label {
		font-weight: bold;
	}

	.code {
		font-family: var(--alternative-font);
		font-size: 1.25em;
		text-transform: uppercase;
	}

	.leave-label {
		padding: 0.25em 1em;
	}
</style>
