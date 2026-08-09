<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import StatedIconButton from '$lib/ui/StatedIconButton.svelte';
	import { theme } from '$lib/ui/theme.svelte';
	import DarkModeOutline from '~icons/material-symbols/dark-mode-outline';
	import LightModeOutline from '~icons/material-symbols/light-mode-outline';
</script>

<StatedIconButton
	icons={[
		{ component: LightModeOutline, alt: m.switch_dark() },
		{ component: DarkModeOutline, alt: m.switch_light() }
	]}
	bind:state={() => theme.current === 'dark', (isDark) => (theme.current = isDark ? 'dark' : 'light')}
/>
