<script lang="ts">
	import ErrorMessage from '$lib/feedback/ErrorMessage.svelte';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import Footer from '$lib/layout/Footer.svelte';
	import Header from '$lib/layout/Header.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';

	let placeholder = m.nickname();
	let {
		sending,
		errorMessage = '',
		setName
	}: {
		sending: boolean;
		errorMessage?: string;
		setName: (name: string) => void;
	} = $props();
	let name = $state('');

	function submit() {
		setName(name);
	}
</script>

<NiceBackground>
	<div class="page">
		<header>
			<Header />
		</header>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<ErrorMessage {errorMessage} />
			<Textfield
				id="name"
				{placeholder}
				autocomplete="nickname"
				required={true}
				showInvalid={false}
				disabled={sending}
				bind:value={name}
			/>
			<div class="submit">
				<FancyButton disabled={sending}>
					<div class="submit-label">
						{#if sending}
							<div class="loading">
								<LoadingCircle />
							</div>
						{/if}
						{m.lets_start()}
					</div>
				</FancyButton>
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

	header {
		margin: 0.5em 0;
	}

	form {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.75em;
		border-radius: 10px;
		box-sizing: content-box;
		width: 300px;
		max-width: 300px;
	}

	.submit {
		width: 100%;
	}

	.submit-label {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--alternative-font);
	}

	.loading {
		height: 1em;
		aspect-ratio: 1 / 1;
		margin: 0 5px;
	}
</style>
