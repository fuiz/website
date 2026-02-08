<script>
	import * as m from '$lib/paraglide/messages.js';

	import Fullscreen from '$lib/layout/Fullscreen.svelte';
	import VolumeUpOutline from '~icons/material-symbols/volume-up-outline';
	import VolumeOffOutline from '~icons/material-symbols/volume-off-outline';
	import LockOpenRightOutline from '~icons/material-symbols/lock-open-right-outline';
	import LockOutline from '~icons/material-symbols/lock-outline';
	import IconButton from '$lib/ui/IconButton.svelte';
	import SkipNext from '~icons/material-symbols/skip-next';
	import StatedIconButton from '$lib/ui/StatedIconButton.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import DarkModeSwitcher from '$lib/ui/DarkModeSwitcher.svelte';
	import ExitFuiz from './ExitFuiz.svelte';

	/** @type {{
	 * 	bindableGameInfo: import('./+page').BindableGameInfo;
	 * 	gameInfo: import('./+page').SharedGameInfo;
	 * 	fullscreenElement?: HTMLElement | undefined;
	 * 	showSkip?: boolean;
	 * 	onnext?: () => void;
	 * 	onlock?: (locked: boolean) => void;
	 * }}*/
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		fullscreenElement = undefined,
		showSkip = false,
		onnext,
		onlock
	} = $props();
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
			<IconButton alt={m.skip()} onclick={onnext}><SkipNext height="1em" /></IconButton>
		{/if}
		<StatedIconButton
			icons={[
				{ component: LockOpenRightOutline, alt: m.lock_game() },
				{ component: LockOutline, alt: m.unlock_game() }
			]}
			size="1em"
			bind:state={bindableGameInfo.locked}
			onchange={onlock}
		/>
		<LanguageSwitcher id="topbar" />
		<DarkModeSwitcher />
		<StatedIconButton
			icons={[
				{ component: VolumeOffOutline, alt: m.turn_on_music() },
				{ component: VolumeUpOutline, alt: m.mute_music() }
			]}
			size="1em"
			bind:state={bindableGameInfo.volumeOn}
		/>
		<Fullscreen {fullscreenElement} />
	</div>
</div>
