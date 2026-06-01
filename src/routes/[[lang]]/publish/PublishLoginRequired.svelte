<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import FancyButton from '$lib/ui/FancyButton.svelte';

	let { gitLoginUrl }: { gitLoginUrl: string } = $props();
</script>

<div class="card">
	<h2 class="title">{m.login_required()}</h2>
	<p class="desc">{m.login_required_desc()}</p>
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- URL is resolved at the call site -->
	<a class="cta" href={gitLoginUrl}>
		<FancyButton type="button" palette="gitlab">
			<div class="cta-label">{m.connect_gitlab()}</div>
		</FancyButton>
	</a>
</div>

<style>
	.card {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		text-align: center;
	}

	.title {
		margin: 0;
		font-family: var(--alternative-font);
		font-size: 1.25em;
	}

	.desc {
		margin: 0 0 0.5em;
		max-width: 28ch;
		opacity: 0.7;
		line-height: 1.4;
	}

	.cta {
		display: inline-block;
		text-decoration: none;
	}

	.cta-label {
		font-family: var(--alternative-font);
		padding: 0 0.5em;
	}
</style>
