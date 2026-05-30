<script lang="ts">
	import { resolve } from '$app/paths';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { type ExportedFuiz } from '$lib/storage';
	import { type FullOnlineFuiz, type GenericIdlessSlide, getMedia, type Media } from '$lib/types';
	import ContentLanguageSelect from '$lib/ui/ContentLanguageSelect.svelte';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import PreviewCard from '$lib/ui/PreviewCard.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import Language from '~icons/material-symbols/language';
	import type { PublishingState } from '../../api/library/publish-stream/types';
	import Grade from './Grade.svelte';
	import Subject from './Subject.svelte';

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

	const steps = [
		{ state: 'generating-keywords' as const, label: 'Generating keywords' },
		{ state: 'forking' as const, label: 'Forking repository' },
		{ state: 'creating-branch' as const, label: 'Creating branch' },
		{ state: 'uploading' as const, label: 'Uploading files' },
		{ state: 'creating-pr' as const, label: 'Creating pull request' }
	];

	// Check Git authentication status on mount
	$effect(() => {
		fetch('/api/git/status')
			.then((res) => res.json())
			.then((status) => {
				gitAuthStatus = status;
				// Pre-fill author with user's full name if authenticated and author is empty
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
			// Step 1: Initialize publish job
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

			// Step 2: Connect to stream
			publishingState = steps[0].state; // Start with the first step

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
			<div class="result">
				<div class="result-card">
					<h2 class="result-title">{m.fuiz_submitted()}</h2>
					<p class="result-desc">{m.fuiz_submitted_desc()}</p>
					{#if prUrl}
						<div>
							<FancyAnchorButton href={prUrl}>
								<div class="btn-label">{m.view_on_gitlab()}</div>
							</FancyAnchorButton>
						</div>
					{/if}
				</div>
			</div>
		{:else if publishingState}
			<div class="progress">
				<h2 class="progress-title">{m.publishing()}</h2>
				<div class="progress-card">
					<div class="steps">
						{#each steps as step, i (step.state)}
							<div
								class="step"
								class:step-done={publishingState &&
									steps
										.slice(i + 1)
										.map((s) => s.state)
										.includes(publishingState)}
								class:step-active={publishingState === step.state}
							>
								{#if publishingState === step.state}
									<div class="step-spinner">
										<LoadingCircle borderWidth={5} />
									</div>
								{/if}
								{step.label}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<form
				class="form"
				onsubmit={(e) => {
					e.preventDefault();
					warningDialog?.open();
				}}
			>
				{#if publishError}
					<p class="error">{publishError}</p>
				{/if}

				{#if gitAuthStatus && !gitAuthStatus.authenticated}
					<div class="auth-card">
						<div class="auth-copy">
							<p class="auth-title">{m.login_required()}</p>
							<p class="auth-desc">{m.login_required_desc()}</p>
						</div>
						<a
							class="auth-link"
							href={resolve(`/api/git/login?provider=gitlab&return=/publish?id=${id}`)}
						>
							<FancyButton
								type="button"
								backgroundColor="#FC6D26"
								backgroundDeepColor="#E24329"
								foregroundColor="#FFFFFF"
							>
								<div class="auth-btn">{m.connect_gitlab()}</div>
							</FancyButton>
						</a>
					</div>
				{/if}
				<div class="preview-wrap">
					<PreviewCard {media} title={creation.config.title} aspectRatio="3 / 2" />
				</div>
				<Textfield
					id="author"
					placeholder={m.author()}
					required
					disabled={false}
					showInvalid={false}
					bind:value={author}
				/>
				<div class="lang-group">
					<div class="lang-label">
						<Language height="1.1em" width="1.1em" />
						<span>{m.language()}</span>
					</div>
					<ContentLanguageSelect bind:value={lang} id="publish-language" />
				</div>
				<Subject bind:tags={subjects} />
				<Grade bind:tags={grades} />
				<div>
					<FancyButton disabled={!gitAuthStatus || !gitAuthStatus.authenticated}>
						<div class="btn-label">{m.request_publish()}</div>
					</FancyButton>
				</div>
			</form>
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
	p {
		margin: 0;
	}

	.page {
		max-width: 40ch;
		margin: auto;
	}

	.btn-label {
		padding: 0.5em 1em;
		font-family: var(--alternative-font);
	}

	/* ---- Submitted state ---- */
	.result {
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding: 2em 1em;
		text-align: center;
	}

	.result-card {
		border: 0.15em solid currentcolor;
		border-radius: 0.7em;
		padding: 1.5em;
		background: var(--surface);
	}

	.result-title {
		font-family: var(--alternative-font);
		margin: 0 0 0.5em;
		font-size: 1.75em;
	}

	.result-desc {
		margin: 0 0 1em;
		line-height: 1.4;
	}

	/* ---- Publishing state ---- */
	.progress {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1em;
		padding: 2em 1em;
	}

	.progress-title {
		font-family: var(--alternative-font);
		margin: 0;
		font-size: 1.5em;
	}

	.progress-card {
		border: 0.15em solid currentcolor;
		border-radius: 0.7em;
		padding: 1em;
		width: 100%;
		box-sizing: border-box;
		background: var(--surface);
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.step {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.step-done {
		opacity: 0.4;
	}

	.step-active {
		font-weight: bold;
	}

	.step-spinner {
		width: 1em;
		height: 1em;
		display: inline-block;
	}

	/* ---- Form ---- */
	.form {
		height: 100%;
		display: flex;
		justify-content: center;
		flex-direction: column;
		gap: 1em;
	}

	.error {
		color: red;
	}

	.auth-card {
		padding: 1em;
		border: 0.15em solid currentcolor;
		border-radius: 0.7em;
		text-align: center;
		background: var(--surface);
		display: flex;
		flex-direction: column;
		gap: 0.75em;
		align-items: center;
	}

	.auth-copy {
		display: flex;
		flex-direction: column;
		gap: 0.3em;
	}

	.auth-title {
		font-family: var(--alternative-font);
		font-weight: 500;
	}

	.auth-desc {
		font-size: 0.9em;
		opacity: 0.8;
	}

	.auth-link {
		display: inline-block;
		text-decoration: none;
	}

	.auth-btn {
		font-family: var(--alternative-font);
		display: flex;
		align-items: center;
		padding: 0 0.5em;
	}

	.preview-wrap {
		width: 15em;
		margin: 0 auto;
	}

	.lang-group {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
	}

	.lang-label {
		display: flex;
		align-items: center;
		gap: 0.4em;
		font-size: 0.85em;
		font-weight: 700;
		opacity: 0.8;
		padding-inline: 0.3em;
	}
</style>
