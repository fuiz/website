<script lang="ts">
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import ErrorMessage from './ErrorMessage.svelte';

	let { errorMessage }: { errorMessage: string } = $props();
</script>

<TypicalPage>
	<div class="root" transition:scale={{ delay: 500, duration: 150, easing: backOut }}>
		<div class="inner">
			<ErrorMessage {errorMessage} />
		</div>
	</div>
</TypicalPage>

<style>
	.root {
		height: 100%;
		display: flex;
		align-items: center;
		max-width: 40ch;
		margin: auto;
	}

	.inner {
		margin: auto;
	}
</style>
