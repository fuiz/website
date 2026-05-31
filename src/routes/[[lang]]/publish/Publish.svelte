<script lang="ts">
	import { resolve } from '$app/paths';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { type ExportedFuiz } from '$lib/storage';
	import { type FullOnlineFuiz, type GenericIdlessSlide, getMedia, type Media } from '$lib/types';
	import type { PublishingState } from '../../api/library/publish-stream/types';
	import PublishForm from './PublishForm.svelte';
	import PublishLoginRequired from './PublishLoginRequired.svelte';
	import PublishProgress from './PublishProgress.svelte';
	import PublishSubmitted from './PublishSubmitted.svelte';

	let {
		creation = $bindable(),
		id
	}: {
		creation: ExportedFuiz;
		id: number;
	} = $props();

	let author = $state('');
	let subjects = $state<string[]>([]);
	let grades = $state<string[]>([]);
	let lang = $state<string>(getLocale());

	let gitAuthStatus = $state<{
		authenticated: boolean;
		provider: string | null;
		user?: { username: string; name: string };
	}>();

	let prUrl = $state<string>();

	let publishError = $state<string>();

	let publishingState = $state<PublishingState | null>(null);

	let warningDialog: ConfirmationDialog | undefined = $state();

	$effect(() => {
		fetch('/api/git/status')
			.then((res) => res.json())
			.then((status) => {
				gitAuthStatus = status;
				if (status.authenticated && status.user && !author) {
					author = status.user.name || status.user.username;
				}
			})
			.catch((err) => {
				console.error('Failed to check Git auth status:', err);
			});
	});

	let media = $derived<Media | undefined>(
		creation.config.slides.reduce(
			(m: Media | undefined, s: GenericIdlessSlide<Media | undefined>) => m || getMedia(s),
			undefined
		)
	);

	async function publish() {
		publishError = undefined;

		const fuiz: FullOnlineFuiz = {
			author,
			subjects,
			grades,
			language: lang,
			config: creation.config
		};

		try {
			const initResponse = await fetch('/api/library/publish-init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fuiz })
			});

			if (!initResponse.ok) {
				const error = await initResponse.json();
				publishError = error.error || 'Failed to start publish';
				return;
			}

			const { jobId } = await initResponse.json();

			publishingState = 'generating-keywords';

			const eventSource = new EventSource(`/api/library/publish-stream?job=${jobId}`);

			eventSource.addEventListener('progress', (e) => {
				const data = JSON.parse(e.data);
				publishingState = data.state;
			});

			eventSource.addEventListener('complete', async (e) => {
				const data = JSON.parse(e.data);
				publishingState = null;
				prUrl = data.pr_url;
				eventSource.close();
			});

			eventSource.addEventListener('error', (e) => {
				// @ts-expect-error SSE error event may have data property
				const data = e.data ? JSON.parse(e.data) : {};
				publishingState = null;
				publishError = data.message || 'Failed to publish';
				eventSource.close();
			});

			eventSource.onerror = () => {
				if (eventSource.readyState === EventSource.CLOSED) {
					if (publishingState !== null) {
						publishingState = null;
						publishError = 'Connection closed unexpectedly';
					}
				}
			};
		} catch (err) {
			publishingState = null;
			publishError = 'An unexpected error occurred';
			console.error('Publish error:', err);
		}
	}
</script>

<TypicalPage>
	<section class="page">
		{#if prUrl}
			<PublishSubmitted {prUrl} />
		{:else if publishingState}
			<PublishProgress state={publishingState} />
		{:else if gitAuthStatus && !gitAuthStatus.authenticated}
			<PublishLoginRequired
				gitLoginUrl={resolve(`/api/git/login?provider=gitlab&return=/publish?id=${id}`)}
			/>
		{:else}
			<PublishForm
				title={creation.config.title}
				{media}
				disabled={!gitAuthStatus?.authenticated}
				{publishError}
				bind:author
				bind:lang
				bind:subjects
				bind:grades
				onSubmit={() => warningDialog?.open()}
			/>
		{/if}
	</section>
</TypicalPage>

<ConfirmationDialog
	bind:this={warningDialog}
	title={m.publish_checklist_title()}
	message={m.publish_checklist_desc()}
	cancelText={m.cancel()}
	confirmText={m.request_publish()}
	onConfirm={publish}
	checklist={[
		m.publish_check_accurate(),
		m.publish_check_appropriate(),
		m.publish_check_language(),
		m.publish_check_media(),
		m.publish_check_relevant()
	]}
/>

<style>
	.page {
		max-width: 40ch;
		height: 100%;
		margin: auto;
	}
</style>
