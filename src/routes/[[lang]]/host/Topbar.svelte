<script>
	import Fullscreen from '$lib/layout/Fullscreen.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import DarkModeSwitcher from '$lib/ui/DarkModeSwitcher.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import StatedIconButton from '$lib/ui/StatedIconButton.svelte';
	import LockOpenRightOutline from '~icons/material-symbols/lock-open-right-outline';
	import LockOutline from '~icons/material-symbols/lock-outline';
	import SkipNext from '~icons/material-symbols/skip-next';
	import VolumeOffOutline from '~icons/material-symbols/volume-off-outline';
	import VolumeUpOutline from '~icons/material-symbols/volume-up-outline';
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

<div class="topbar">
	<ExitFuiz />
	<div class="slide-index">
		{m.slide_index({
			index: gameInfo.questionIndex + 1,
			total: gameInfo.questionTotalCount
		})}
	</div>
	<div class="game-code">
		{m.game_code_display({
			code: gameInfo.gameCode
		})}
	</div>
	<div class="controls">
		{#if showSkip}
			<IconButton alt={m.skip()} onclick={onnext}><SkipNext /></IconButton>
		{/if}
		<StatedIconButton
			icons={[
				{ component: LockOpenRightOutline, alt: m.lock_game() },
				{ component: LockOutline, alt: m.unlock_game() }
			]}
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
			bind:state={bindableGameInfo.volumeOn}
		/>
		<Fullscreen {fullscreenElement} />
	</div>
</div>

<style>
	.topbar {
		display: flex;
		background: var(--surface);
		padding: 0.2em;
		line-height: 1em;
		align-items: center;
		gap: 10px;
		row-gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.slide-index {
		display: flex;
		padding: 0.2em 0.4em;
		gap: 2px;
		align-items: center;
		font-family: var(--alternative-font);
		font-weight: 800;
	}

	.game-code {
		flex: 100;
		justify-content: center;
		display: flex;
		gap: 1ch;
		align-items: baseline;
		white-space: nowrap;
		font-family: var(--alternative-font);
		font-weight: 800;
	}

	.controls {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.2em;
		padding: 0.2em;
	}

	@media (max-width: 600px) {
		.topbar {
			font-size: 1.25em;
		}

		.controls {
			gap: 0.5em;
		}
	}
</style>
