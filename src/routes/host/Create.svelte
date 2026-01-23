<script>
	import * as m from '$lib/paraglide/messages.js';

	import { playJsonString } from '$lib';
	import ErrorMessage from '$lib/ErrorMessage.svelte';
	import FancyAnchorButton from '$lib/FancyAnchorButton.svelte';
	import FancyButton from '$lib/FancyButton.svelte';
	import Loading from '$lib/Loading.svelte';
	import Textarea from '$lib/Textarea.svelte';
	import TypicalPage from '$lib/TypicalPage.svelte';
	import { getAllCreations, loadDatabase } from '$lib/storage';
	import { toSorted } from '$lib/util';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props();

	let loading = $state(false);
	let fuizConfig = $state('');
	let errorMessage = $state('');

	/**
	 * @param {string} error
	 */
	function reset(error) {
		errorMessage = error;
		loading = false;
	}

	async function submit() {
		loading = true;

		let value = await playJsonString(fuizConfig);

		if (value) {
			reset(value);
		}
	}
</script>

{#await loadDatabase().then((db) => getAllCreations(db))}
	<Loading />
{:then creations}
	{@const sortedCreations = toSorted(creations, (a, b) => -b.lastEdited - a.lastEdited)}
	<TypicalPage>
		<div style:max-width="25ch" style:margin="auto">
			{#if creations.length > 0}
				<h2>{m.choose_local()}</h2>
				<ul id="creations-list">
					{#each sortedCreations as { title, id, slidesCount }, index}
						<li class="creation"><a href={'?id=' + id}>{title} · {slidesCount} slides</a></li>
						{#if index + 1 != creations.length}
							<hr />
						{/if}
					{/each}
				</ul>
			{:else}
				<div>
					<FancyAnchorButton href={localizeHref('/create')}>
						<div class="create">{m.create()}</div>
					</FancyAnchorButton>
				</div>
			{/if}

			<form
				onsubmit={(e) => {
					e.preventDefault();
					submit();
				}}
			>
				<h2>{m.or_paste_config()}</h2>
				<ErrorMessage {errorMessage} />
				<Textarea
					id="config"
					placeholder={m.fuiz_config_json()}
					required={true}
					disabled={loading}
					bind:value={fuizConfig}
				/>
				<div style:margin="5px 0" style:width="100%">
					<FancyButton disabled={loading}>
						<div
							style:display="flex"
							style:align-items="center"
							style:justify-content="center"
							style:font-family="Poppins"
						>
							{m.host()}
						</div>
					</FancyButton>
				</div>
			</form>
		</div>
	</TypicalPage>
{/await}

<style>
	form {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		border-radius: 10px;
		box-sizing: content-box;
		margin-top: 3em;
		width: 100%;
	}

	#creations-list {
		display: flex;
		flex-direction: column;
		border: 0.2em solid;
		border-radius: 0.5em;
		padding: 0;
		margin: 0;
	}

	.creation {
		display: flex;
	}

	hr {
		appearance: none;
		width: 100%;
		color: inherit;
		border-top: 0.2em solid;
		margin: 0;
	}

	h2 {
		margin: 0 0 0.5em;
		font-size: 1.25em;
	}

	.creation a {
		flex: 1;
		text-decoration: inherit;
		color: inherit;
		padding: 0.4em;
		margin: 0;
	}

	.create {
		font-family: Poppins;
		text-align: center;
	}
</style>
