<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import Fullscreen from '$lib/Fullscreen.svelte';
	import volume_up from '$lib/assets/volume_up.svg';
	import volume_off from '$lib/assets/volume_off.svg';
	import unlocked from '$lib/assets/unlocked.svg';
	import locked from '$lib/assets/locked.svg';
	import IconButton from '$lib/IconButton.svelte';
	import skip from '$lib/assets/skip.svg';
	import type { BindableGameInfo, SharedGameInfo } from './+page';
	import StatedIconButton from '$lib/StatedIconButton.svelte';
	import LanguageSwitcher from '$lib/LanguageSwitcher.svelte';
	import DarkModeSwitcher from '$lib/DarkModeSwitcher.svelte';
	import ExitFuiz from './ExitFuiz.svelte';

	interface Props {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		fullscreenElement?: HTMLElement | undefined;
		showSkip?: boolean;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
	}

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		fullscreenElement = undefined,
		showSkip = false,
		onnext,
		onlock
	}: Props = $props();
</script>

<div
	style:display="flex"
	style:background="var(--background-color)"
	style:padding="0.2em"
	style:line-height="1em"
	style:align-items="center"
	style:gap="10px"
	style:row-gap="20px"
	style:justify-content="center"
	style:flex-wrap="wrap"
>
	<ExitFuiz />
	<div
		style:display="flex"
		style:padding="0.2em 0.4em"
		style:gap="2px"
		style:align-items="center"
		style:font-family="Poppins"
		style:font-weight="800"
	>
		<div style:font-family="Poppins">
			{m.slide_index({
				index: gameInfo.questionIndex + 1,
				total: gameInfo.questionTotalCount
			})}
		</div>
	</div>
	<div
		style:flex="100"
		style:justify-content="center"
		style:display="flex"
		style:gap="1ch"
		style:align-items="baseline"
		style:white-space="nowrap"
		style:font-family="Poppins"
		style:font-weight="800"
	>
		{m.game_code_display({
			code: gameInfo.gameCode
		})}
	</div>
	<div
		style:flex="1"
		style:display="flex"
		style:justify-content="space-between"
		style:align-items="center"
		style:gap="0.2em"
		style:padding="0.2em"
	>
		{#if showSkip}
			<IconButton src={skip} alt={m.skip()} size="1em" onclick={onnext} />
		{/if}
		<StatedIconButton
			icons={[
				{ src: unlocked, alt: m.lock_game() },
				{ src: locked, alt: m.unlock_game() }
			]}
			size="1em"
			bind:state={bindableGameInfo.locked}
			onchange={onlock}
		/>
		<LanguageSwitcher />
		<DarkModeSwitcher />
		<StatedIconButton
			icons={[
				{ src: volume_off, alt: m.turn_on_music() },
				{ src: volume_up, alt: m.mute_music() }
			]}
			size="1em"
			bind:state={bindableGameInfo.volumeOn}
		/>
		<Fullscreen {fullscreenElement} />
	</div>
</div>
