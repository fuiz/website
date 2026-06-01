<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import ErrorMessage from '$lib/feedback/ErrorMessage.svelte';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import Footer from '$lib/layout/Footer.svelte';
	import Header from '$lib/layout/Header.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import { bring } from '$lib/util';

	let sending = $state(false);
	let gameCode = $state('');

	let errorMessage = $state('');

	async function submit() {
		sending = true;

		const res = await bring(env.PUBLIC_BACKEND_URL + '/alive/' + gameCode.toUpperCase(), {
			method: 'GET',
			mode: 'cors'
		});
		if (res === undefined) {
			errorMessage = m.cannot_connect();
		} else {
			let text = await res.text();
			if (text === 'true') {
				await goto(resolve(localizeHref(`/play?code=${gameCode.toUpperCase()}`)));
				return;
			} else {
				errorMessage = m.code_not_exist();
			}
		}

		sending = false;
	}
</script>

<NiceBackground>
	<div class="page">
		<header class="header">
			<Header />
		</header>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<div class="body">
				{#if errorMessage}
					<div class="error">
						<ErrorMessage {errorMessage} />
					</div>
				{/if}
				<Textfield
					id="code"
					placeholder={m.game_code()}
					required={true}
					disabled={sending}
					showInvalid={false}
					bind:value={gameCode}
					textTransform="uppercase"
					inputmode="numeric"
				/>
				<div>
					<FancyButton disabled={sending}>
						<div class="cta">
							{#if sending}
								<div class="spinner">
									<LoadingCircle />
								</div>
							{/if}
							{m.join()}
						</div>
					</FancyButton>
				</div>
			</div>
		</form>
		<Footer />
	</div>
</NiceBackground>

<style>
	.page {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.header {
		margin: 0.5em 0;
	}

	form {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: 10px;
		box-sizing: content-box;
		width: 300px;
		max-width: 300px;
	}

	.body {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
	}

	.error {
		margin-bottom: 10px;
	}

	.cta {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--alternative-font);
	}

	.spinner {
		height: 1em;
		aspect-ratio: 1 / 1;
		margin: 0 5px;
	}
</style>
