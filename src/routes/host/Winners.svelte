<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import NiceBackground from '$lib/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';
	import TextBar from '$lib/Game/TextBar.svelte';
	import type { BindableGameInfo, SharedGameInfo } from './+page';

	interface Props {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		winners: string[];
		lock: () => void;
		next: () => void;
	}

	let { bindableGameInfo = $bindable(), gameInfo, winners, lock, next }: Props = $props();

	let fullscreenElement: HTMLElement | undefined = $state();
</script>

<div style:height="100%" bind:this={fullscreenElement}>
	<NiceBackground>
		<Topbar bind:bindableGameInfo {gameInfo} {fullscreenElement} onlock={lock} />
		<TextBar onnext={next} text={m.winners()} showNext={true} heading={true} />
		<div
			style:display="flex"
			style:flex-direction="column"
			style:max-width="30ch"
			style:margin="auto"
			style:text-align="center"
			style:padding="0.3em"
			style:gap="0.3em"
		>
			{#each winners as w}
				<div
					style:background="var(--background-color)"
					style:border="0.15em solid currentcolor"
					style:padding="0.15em 0.4em"
					style:font-weight="bold"
					style:border-radius="0.6em"
				>
					<div style:font-size="1.5em">
						{w}
					</div>
				</div>
			{/each}
		</div>
	</NiceBackground>
</div>
