<script lang="ts">
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import Chip from '$lib/ui/Chip.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import Topbar from './Topbar.svelte';

	let {
		name,
		selected,
		suggestions,
		max_selection,
		onsearch,
		ondeselect
	}: {
		name: string;
		selected: string[];
		suggestions: string[];
		max_selection: number;
		onsearch: (query: string) => void;
		ondeselect: (name: string) => void;
	} = $props();

	let query = $state('');

	function submitSearch() {
		const value = query.trim();
		if (value.length === 0) return;
		onsearch(value);
	}

	function pickSuggestion(suggestion: string) {
		onsearch(suggestion);
		query = '';
	}

	$effect(() => {
		if (suggestions.length === 0 && selected.length > 0) {
			query = '';
		}
	});
</script>

<div class="page">
	<Topbar {name} />
	<div class="body">
		<NiceBackground>
			<div class="center">
				<div class="content">
					<div class="title">
						{m.choose_teammates()}
					</div>
					<div>{m.choose_teammates_desc()}</div>

					{#if selected.length > 0}
						<div class="chips">
							{#each selected as teammate (teammate)}
								<Chip
									selected
									removable
									ariaLabel={m.remove_teammate({ name: teammate })}
									onclick={() => ondeselect(teammate)}
								>
									{teammate}
								</Chip>
							{/each}
						</div>
					{/if}

					{#if selected.length < max_selection}
						<form
							class="search-form"
							onsubmit={(e) => {
								e.preventDefault();
								submitSearch();
							}}
						>
							<Textfield
								id="teammate-search"
								placeholder={m.type_teammate_name()}
								autocomplete="off"
								required={false}
								showInvalid={false}
								disabled={false}
								bind:value={query}
							/>
							<FancyButton type="submit" disabled={query.trim().length === 0}>
								{m.search()}
							</FancyButton>
						</form>

						{#if suggestions.length > 0}
							<div class="suggestions">
								{#each suggestions as suggestion (suggestion)}
									<button
										class="suggestion"
										type="button"
										onclick={() => pickSuggestion(suggestion)}
									>
										{suggestion}
									</button>
								{/each}
							</div>
						{/if}
					{/if}
				</div>
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	.page {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.body {
		flex: 1;
	}

	.center {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1em;
		padding: 1em;
		max-width: 24em;
		width: 100%;
	}

	.title {
		font-weight: bold;
		font-family: var(--alternative-font);
		font-size: 1.5em;
		max-width: 10ch;
		text-align: center;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
		justify-content: center;
	}

	.search-form {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 0.5em;
	}

	.suggestions {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 0.3em;
	}

	.suggestion {
		background: var(--surface-variant);
		border: none;
		padding: 0.4em 0.6em;
		border-radius: 0.6em;
		font-family: inherit;
		font-size: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
</style>
