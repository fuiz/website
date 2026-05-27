<script lang="ts">
	import type { Snippet } from 'svelte';
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import NiceBackground from './NiceBackground.svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<NiceBackground>
	<div class="page">
		<header>
			<Header />
		</header>
		<section>
			{@render children?.()}
		</section>
		<footer>
			<Footer />
		</footer>
	</div>
</NiceBackground>

<style>
	.page {
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 0.5em 0 0;
		gap: 0.5em;
		box-sizing: border-box;
	}

	header {
		display: flex;
		justify-content: center;
	}

	section {
		flex: 1;
		width: 100%;
	}

	footer {
		width: 100%;
	}
</style>
