<script lang="ts">
	import NiceBackground from './NiceBackground.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<NiceBackground>
	<div
		style:height="100%"
		style:display="flex"
		style:flex-direction="column"
		style:padding="0.5em 0.5em 0"
		style:gap="0.5em"
		style:align-items="center"
		style:box-sizing="border-box"
	>
		<header>
			<Header />
		</header>
		<section style:flex="1" style:width="100%">
			{@render children?.()}
		</section>
		<footer>
			<Footer />
		</footer>
	</div>
</NiceBackground>
