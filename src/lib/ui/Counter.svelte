<script lang="ts">
	import { expoOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { getLocale } from '$lib/paraglide/runtime';

	let { value, duration, delay }: { value: number; duration: number; delay: number } = $props();

	// svelte-ignore state_referenced_locally
	const shown = Tween.of(() => value, { duration, delay, easing: expoOut });
</script>

<div>{Math.round(shown.current).toLocaleString(getLocale())}</div>
