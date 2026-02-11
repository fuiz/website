<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
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

		const res = await bring(PUBLIC_BACKEND_URL + '/alive/' + gameCode.toUpperCase(), {
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
	<div
		style:height="100%"
		style:display="flex"
		style:flex-direction="column"
		style:align-items="center"
	>
		<header style:margin="0.5em 0">
			<Header />
		</header>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<div
				style:flex="1"
				style:display="flex"
				style:flex-direction="column"
				style:justify-content="center"
				style:gap="5px"
			>
				{#if errorMessage}
					<div style:margin-bottom="10px">
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
						<div
							style:display="flex"
							style:align-items="center"
							style:justify-content="center"
							style:font-family="var(--alternative-font)"
						>
							{#if sending}
								<div style:height="1em" style:aspect-ratio="1/1" style:margin="0 5px">
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
</style>
