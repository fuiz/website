<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';

	let { prUrl }: { prUrl: string } = $props();
</script>

<div class="card">
	<h2 class="title">{m.fuiz_submitted()}</h2>
	<p class="desc">{m.fuiz_submitted_desc()}</p>
	<div class="cta">
		<FancyAnchorButton
			href={prUrl}
			backgroundColor="#FC6D26"
			backgroundDeepColor="#E24329"
			foregroundColor="#FFFFFF"
		>
			<div class="cta-label">{m.view_on_gitlab()}</div>
		</FancyAnchorButton>
	</div>
</div>

<style>
	.card {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.6em;
		text-align: center;
	}

	.title {
		margin: 0;
		font-family: var(--alternative-font);
		font-size: 1.5em;
		line-height: 1.2;
	}

	.desc {
		margin: 0 0 0.5em;
		max-width: 30ch;
		opacity: 0.7;
		line-height: 1.4;
	}

	.cta {
		display: inline-block;
	}

	.cta-label {
		font-family: var(--alternative-font);
		padding: 0 0.5em;
	}
</style>
