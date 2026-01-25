<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import Textfield from '$lib/Textfield.svelte';
	import TypicalPage from '$lib/TypicalPage.svelte';
	import SelectTime from '$lib/SelectTime.svelte';
	import { locales, getLocale, type Locale } from '$lib/paraglide/runtime.js';
	import Icon from '$lib/Icon.svelte';
	import FancyButton from '$lib/FancyButton.svelte';
	import FancyAnchorButton from '$lib/FancyAnchorButton.svelte';
	import MediaContainer from '$lib/MediaContainer.svelte';
	import LoadingCircle from '$lib/LoadingCircle.svelte';
	import { getMedia, type FullOnlineFuiz, type GenericIdlessSlide, type Media } from '$lib/types';
	import { updateCreation, type Database, type ExportedFuiz } from '$lib/storage';
	import Subject from './Subject.svelte';
	import Grade from './Grade.svelte';

	let {
		creation = $bindable(),
		id,
		db
	}: {
		creation: ExportedFuiz;
		id: number;
		db: Database;
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

	let publishingState = $state<'forking' | 'creating-branch' | 'uploading' | 'creating-pr' | null>(
		null
	);

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
			const initResponse = await fetch('/api/publish-init', {
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
			publishingState = 'forking';

			const eventSource = new EventSource(`/api/publish-stream?job=${jobId}`);

			eventSource.addEventListener('progress', (e) => {
				const data = JSON.parse(e.data);
				publishingState = data.state;
			});

			eventSource.addEventListener('complete', async (e) => {
				const data = JSON.parse(e.data);
				publishingState = null;
				prUrl = data.pr_url;

				creation = {
					...creation,
					publish: {
						...creation.publish,
						pending_r2_key: data.r2_key
					}
				};

				await updateCreation(id, creation, db);
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
		{#if !creation?.publish?.pending_r2_key}
			{#if publishingState}
				<div
					style:display="flex"
					style:flex-direction="column"
					style:justify-content="center"
					style:align-items="center"
					style:gap="1em"
					style:padding="2em 1em"
				>
					<h2 style:font-family="Poppins" style:margin="0" style:font-size="1.5em">
						Publishing...
					</h2>
					<div
						style:border="0.15em solid currentcolor"
						style:border-radius="0.7em"
						style:padding="1em"
						style:width="100%"
						style:box-sizing="border-box"
						style:background="var(--background-color)"
					>
						<div style:display="flex" style:flex-direction="column" style:gap="0.5em">
							<div
								class="step"
								class:step-done={['creating-branch', 'uploading', 'creating-pr'].includes(
									publishingState
								)}
								class:step-active={publishingState === 'forking'}
							>
								{#if publishingState === 'forking'}
									<div style:width="1em" style:height="1em" style:display="inline-block">
										<LoadingCircle borderWidth={5} />
									</div>
								{/if}
								Forking repository
							</div>
							<div
								class="step"
								class:step-done={['uploading', 'creating-pr'].includes(publishingState)}
								class:step-active={publishingState === 'creating-branch'}
							>
								{#if publishingState === 'creating-branch'}
									<div style:width="1em" style:height="1em" style:display="inline-block">
										<LoadingCircle borderWidth={5} />
									</div>
								{/if}
								Creating branch
							</div>
							<div
								class="step"
								class:step-done={publishingState === 'creating-pr'}
								class:step-active={publishingState === 'uploading'}
							>
								{#if publishingState === 'uploading'}
									<div style:width="1em" style:height="1em" style:display="inline-block">
										<LoadingCircle borderWidth={5} />
									</div>
								{/if}
								Uploading files
							</div>
							<div class="step" class:step-active={publishingState === 'creating-pr'}>
								{#if publishingState === 'creating-pr'}
									<div style:width="1em" style:height="1em" style:display="inline-block">
										<LoadingCircle borderWidth={5} />
									</div>
								{/if}
								Creating pull request
							</div>
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
						publish();
					}}
				>
					{#if publishError}
						<p style:color="red">{publishError}</p>
					{/if}

					{#if gitAuthStatus && !gitAuthStatus.authenticated}
						<div style:padding="1em" style:background="#fff3cd" style:border-radius="0.5em">
							<p style:margin-bottom="0.5em">You need to login with GitLab to publish fuizzes.</p>
							<a
								href="/api/git/login?provider=gitlab&return=/publish?id={id}"
								style:color="#0066cc"
							>
								Login with GitLab
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
							<Icon src="$lib/assets/language.svg" alt={m.language()} size="1em" />
						</SelectTime>
					</div>
					<div>
						<FancyButton disabled={gitAuthStatus && !gitAuthStatus.authenticated}
							><div style:font-family="Poppins">
								{m.request_publish()}
							</div>
						</FancyButton>
					</div>
				</form>
			{/if}
		{:else}
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
		{/if}
	</section>
</TypicalPage>

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
