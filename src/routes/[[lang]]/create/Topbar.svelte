<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { downloadFuiz, limits } from '$lib/clientOnly';
	import Logo from '$lib/media/Logo.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { CreationId, Database } from '$lib/storage';
	import { getCreation } from '$lib/storage';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import Download from '~icons/material-symbols/download';
	import Globe from '~icons/material-symbols/globe';
	import Share from '~icons/material-symbols/share';
	import SlideshowOutlineSharp from '~icons/material-symbols/slideshow-outline-sharp';

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

<div
	style:display="flex"
	style:flex-wrap="wrap"
	style:gap="20px"
	style:box-shadow="0 2px 2px #00000040"
	style:padding="10px"
	style:z-index="1"
	style:align-items="center"
	style:justify-content="center"
>
	<a
		href={resolve(localizeHref('/create'))}
		style:height="65px"
		style:margin="0 5px"
		style:overflow="hidden"
		style:color="inherit"
	>
		<Logo height={65} />
	</a>
	<div
		style:flex="1"
		style:display="flex"
		style:gap="10px"
		style:flex-wrap="wrap"
		style:justify-content="center"
	>
		<div
			style:flex="1"
			style:display="flex"
			style:align-items="center"
			style:gap="10px"
			style:justify-content="center"
			style:font-size="24px"
			style:min-width="15ch"
		>
			<Textfield
				bind:value={title}
				placeholder={m.fuiz_title()}
				required={false}
				id="title"
				disabled={false}
				maxLength={limits.fuiz.maxTitleLength}
			/>
		</div>
		<div style:display="flex" style:align-items="center" style:gap="0.2em" style:padding="0.2em">
			{#if showPublish}
				<IconButton
					alt={m.publish_title()}
					onclick={() => goto(resolve(localizeHref('/publish?id=' + id)))}
				>
					<Globe height="1em" />
				</IconButton>
			{/if}
			{#if showShare}
				<div bind:this={shareWrapper}>
					<IconButton
						alt={m.share()}
						onclick={() => {
							onshare(showCopied);
						}}
					>
						<Share height="1em" />
					</IconButton>
					<div bind:this={copiedPopover} popover="manual" class="fuiz-popover" style:position-area="bottom">{m.copied()}</div>
				</div>
			{/if}
			<IconButton alt={m.download()} onclick={() => onDownload(id)}>
				<Download height="1em" />
			</IconButton>
			<div
				interestfor="error-popover"
			>
				<IconButton
					alt={m.host()}
					disabled={errorMessage != undefined}
					onclick={() => goto(resolve(localizeHref('/host?id=' + id)))}
				>
					<SlideshowOutlineSharp height="1em" />
				</IconButton>
				{#if errorMessage}
					<div id="error-popover" popover="hint" class="fuiz-popover" style:position-area="bottom">{errorMessage}</div>
				{/if}
			</div>
		</div>
	</div>
</div>
