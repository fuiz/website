<script lang="ts">
	import ErrorMessage from '$lib/feedback/ErrorMessage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { type Media } from '$lib/types';
	import ContentLanguageSelect from '$lib/ui/ContentLanguageSelect.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import PreviewCard from '$lib/ui/PreviewCard.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import WavyCircular from '$lib/ui/WavyCircular.svelte';
	import Language from '~icons/material-symbols/language';
	import Grade from './Grade.svelte';
	import Subject from './Subject.svelte';

	let {
		title,
		media,
		disabled = false,
		publishError,
		progress = undefined,
		author = $bindable(''),
		lang = $bindable(''),
		subjects = $bindable<string[]>([]),
		grades = $bindable<string[]>([]),
		onSubmit
	}: {
		title: string;
		media: Media | undefined;
		disabled?: boolean;
		publishError?: string;
		/** Set while publishing: what to say, and how far along it is when that can be counted. */
		progress?: { label: string; value: number | undefined };
		author?: string;
		lang?: string;
		subjects?: string[];
		grades?: string[];
		onSubmit: () => void;
	} = $props();
</script>

<form
	class="form"
	onsubmit={(e) => {
		e.preventDefault();
		onSubmit();
	}}
>
	{#if publishError}
		<ErrorMessage errorMessage={publishError} />
	{/if}

	<div class="preview-wrap">
		<PreviewCard {media} {title} aspectRatio="3 / 2" />
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
		<FancyButton disabled={disabled || progress !== undefined}>
			<div class="btn-label">
				{#if progress}
					<!-- Sending the quiz and counting the steps are separate indicators,
					     so the switch between them starts the second one fresh. -->
					{#key progress.value === undefined}
						<WavyCircular value={progress.value} size={26} thick label={progress.label} />
					{/key}
					<span aria-live="polite">{progress.label}</span>
				{:else}
					{m.request_publish()}
				{/if}
			</div>
		</FancyButton>
	</div>
</form>

<style>
	.form {
		height: 100%;
		display: flex;
		justify-content: center;
		flex-direction: column;
		gap: 1em;
	}

	.btn-label {
		/* The indicator in the button's own white, on the disabled grey. */
		--wavy-active: currentColor;
		--wavy-track: color-mix(in srgb, currentColor 30%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		min-height: 1.3em;
		font-family: var(--alternative-font);
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
