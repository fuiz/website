<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import Textfield from '$lib/ui/Textfield.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import SelectTime from '$lib/ui/SelectTime.svelte';
	import { locales, getLocale, type Locale } from '$lib/paraglide/runtime.js';
	import Icon from '$lib/media/Icon.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import { getMedia, type FullOnlineFuiz, type GenericIdlessSlide, type Media } from '$lib/types';
	import { type ExportedFuiz } from '$lib/storage';
	import Subject from './Subject.svelte';
	import Grade from './Grade.svelte';
	import type { PublishingState } from '../../api/library/publish-stream/types';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';

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
	let lang = $state<Locale>(getLocale());

	let gitAuthStatus = $state<
		| { authenticated: boolean; provider: string | null; user?: { username: string; name: string } }
		| undefined
	>(undefined);

	let prUrl = $state<string | undefined>(undefined);

	let publishError = $state<string | undefined>(undefined);

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

	function map(lang: string): string {
		return (
			new Intl.DisplayNames([lang], {
				type: 'language'
			}).of(lang) || lang
		);
	}

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
				// @ts-ignore
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
	<section style:max-width="40ch" style:margin="auto">
		{#if prUrl}
			<div
				style:display="flex"
				style:flex-direction="column"
				style:gap="1em"
				style:padding="2em 1em"
				style:text-align="center"
			>
				<div
					style:border="0.15em solid currentcolor"
					style:border-radius="0.7em"
					style:padding="1.5em"
					style:background="var(--background-color)"
				>
					<h2 style:font-family="Poppins" style:margin="0 0 0.5em" style:font-size="1.75em">
						Fuiz Submitted!
					</h2>
					<p style:margin="0 0 1em 0" style:line-height="1.4">
						Your fuiz has been submitted for review. It will be published once the pull request is
						reviewed and merged by maintainers.
					</p>
					{#if prUrl}
						<div>
							<FancyAnchorButton href={prUrl}>
								<div style:padding="0.5em 1em" style:font-family="Poppins">View on GitLab</div>
							</FancyAnchorButton>
						</div>
					{/if}
				</div>
			</div>
		{:else if publishingState}
			<div
				style:display="flex"
				style:flex-direction="column"
				style:justify-content="center"
				style:align-items="center"
				style:gap="1em"
				style:padding="2em 1em"
			>
				<h2 style:font-family="Poppins" style:margin="0" style:font-size="1.5em">Publishing...</h2>
				<div
					style:border="0.15em solid currentcolor"
					style:border-radius="0.7em"
					style:padding="1em"
					style:width="100%"
					style:box-sizing="border-box"
					style:background="var(--background-color)"
				>
					<div style:display="flex" style:flex-direction="column" style:gap="0.5em">
						{#each steps as step, i}
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
									<div style:width="1em" style:height="1em" style:display="inline-block">
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
				style:height="100%"
				style:display="flex"
				style:justify-content="center"
				style:flex-direction="column"
				style:gap="0.5em"
				onsubmit={(e) => {
					e.preventDefault();
					warningDialog?.open();
				}}
			>
				{#if publishError}
					<p style:color="red">{publishError}</p>
				{/if}

				{#if gitAuthStatus && !gitAuthStatus.authenticated}
					<div
						style:padding="1em"
						style:border="0.15em solid currentcolor"
						style:border-radius="0.7em"
						style:text-align="center"
						style:background="var(--background-color)"
						style:display="flex"
						style:flex-direction="column"
						style:gap="0.75em"
						style:align-items="center"
					>
						<div style:display="flex" style:flex-direction="column" style:gap="0.3em">
							<p style:margin="0" style:font-family="Poppins" style:font-weight="500">
								Login Required
							</p>
							<p style:margin="0" style:font-size="0.9em" style:opacity="0.8">
								You need to authenticate with GitLab to publish fuizzes
							</p>
						</div>
						<a
							href="/api/git/login?provider=gitlab&return=/publish?id={id}"
							style:display="inline-block"
							style:text-decoration="none"
						>
							<FancyButton
								type="button"
								backgroundColor="#FC6D26"
								backgroundDeepColor="#E24329"
								foregroundColor="#FFFFFF"
							>
								<div
									style:font-family="Poppins"
									style:display="flex"
									style:align-items="center"
									style:padding="0 0.5em"
								>
									Connect GitLab Account
								</div>
							</FancyButton>
						</a>
					</div>
				{/if}
				<div
					style:border="0.15em solid"
					style:border-radius="0.5em"
					style:overflow="hidden"
					style:width="fit-content"
					style:margin="auto"
				>
					<div
						style:aspect-ratio="3 / 2"
						style:height="10em"
						style:width="auto"
						style:margin="auto"
						style:position="relative"
					>
						<MediaContainer {media} fit="cover" />
					</div>
					<div
						style:padding="0.15em 0.3em"
						style:word-break="break-word"
						style:border-top="0.15em solid"
					>
						{creation.config.title}
					</div>
				</div>
				<Textfield
					id="author"
					placeholder={m.author()}
					required
					disabled={false}
					showInvalid={false}
					bind:value={author}
				/>
				<Subject bind:tags={subjects} />
				<Grade bind:tags={grades} />
				<div>
					<SelectTime options={[...locales]} bind:selected={lang} {map}>
						<Icon src="$lib/assets/icons/language.svg" alt={m.language()} size="1em" />
					</SelectTime>
				</div>
				<div>
					<FancyButton disabled={!gitAuthStatus || !gitAuthStatus.authenticated}
						><div style:font-family="Poppins">
							{m.request_publish()}
						</div>
					</FancyButton>
				</div>
			</form>
		{/if}
	</section>
</TypicalPage>

<ConfirmationDialog
	bind:this={warningDialog}
	title="Warning"
	message="Requesting to publish this fuiz will make it public to everyone after it is reviewed and approved. Your fuiz will be visible in the public library and accessible to all users."
	cancelText="Cancel"
	confirmText="Continue"
	onConfirm={publish}
/>

<style>
	p {
		margin: 0;
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
</style>
