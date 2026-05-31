<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { downloadFuiz, limits } from '$lib/clientOnly';
	import Logo from '$lib/media/Logo.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { CreationId, Database } from '$lib/storage';
	import { getCreation } from '$lib/storage';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import Download from '~icons/material-symbols/download';
	import LiveTv from '~icons/material-symbols/live-tv-outline';
	import Publish from '~icons/material-symbols/publish';
	import Share from '~icons/material-symbols/share';

	let {
		title = $bindable(),
		id,
		db,
		errorMessage,
		onshare,
		showPublish,
		showShare
	}: {
		title: string;
		id: number;
		db: Database;
		errorMessage: string | undefined;
		onshare: (showCopied: () => void) => void;
		showPublish?: boolean;
		showShare?: boolean;
	} = $props();

	let copiedPopover = $state<HTMLDivElement>();
	let shareWrapper = $state<HTMLDivElement>();
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	function showCopied() {
		try {
			copiedPopover?.showPopover({ source: shareWrapper });
		} catch {
			/* already shown */
		}
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => {
			try {
				copiedPopover?.hidePopover();
			} catch {
				/* already hidden */
			}
		}, 1500);
	}

	async function onDownload(id: CreationId) {
		const creation = await getCreation(id, db);
		if (!creation) return;
		const configJson = creation.config;
		await downloadFuiz(configJson);
	}
</script>

<header class="topbar">
	<a class="brand" href={resolve(localizeHref('/create'))} title="Fuiz">
		<Logo height={36} />
	</a>

	<div class="title-wrap">
		<Textfield
			bind:value={title}
			placeholder={m.fuiz_title()}
			required={false}
			id="title"
			disabled={false}
			maxLength={limits.fuiz.maxTitleLength}
		/>
	</div>

	<div class="actions">
		{#if showPublish}
			<IconButton
				alt={m.publish_title()}
				padding="0.4em"
				onclick={() => goto(resolve(localizeHref('/publish?id=' + id)))}
			>
				<Publish height="1.1em" />
			</IconButton>
		{/if}
		{#if showShare}
			<div bind:this={shareWrapper}>
				<IconButton
					alt={m.share()}
					padding="0.4em"
					onclick={() => {
						onshare(showCopied);
					}}
				>
					<Share height="1.1em" />
				</IconButton>
				<div bind:this={copiedPopover} popover="manual" class="fuiz-popover">
					{m.copied()}
				</div>
			</div>
		{/if}
		<IconButton alt={m.download()} padding="0.4em" onclick={() => onDownload(id)}>
			<Download height="1.1em" />
		</IconButton>
		<div class="host-wrap" interestfor="error-popover">
			<FancyButton
				disabled={errorMessage != undefined}
				onclick={() => goto(resolve(localizeHref('/host?id=' + id)))}
			>
				<div class="host-label">
					<LiveTv height="1.1em" />
					<span>{m.host()}</span>
				</div>
			</FancyButton>
			{#if errorMessage}
				<div id="error-popover" popover="hint" class="fuiz-popover">{errorMessage}</div>
			{/if}
		</div>
	</div>
</header>

<style>
	.topbar {
		display: flex;
		align-items: center;
		gap: 0.7em;
		padding: 0.4em 0.7em;
		background: var(--surface);
		border-bottom: 1px solid var(--outline);
		z-index: 1;
	}

	.brand {
		display: inline-flex;
		color: inherit;
		text-decoration: none;
		flex-shrink: 0;
	}

	.title-wrap {
		flex: 1;
		max-width: 28ch;
		min-width: 12ch;
		margin: 0 auto;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.15em;
		flex-shrink: 0;
	}

	.host-wrap {
		display: inline-block;
		margin-inline-start: 0.3em;
	}

	.host-label {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		padding: 0 0.6em;
		font-family: var(--alternative-font);
		white-space: nowrap;
	}

	@media (max-width: 40em) {
		.topbar {
			flex-wrap: wrap;
			justify-content: space-between;
			gap: 0.5em;
		}

		.title-wrap {
			order: 3;
			flex-basis: 100%;
			max-width: none;
		}
	}
</style>
