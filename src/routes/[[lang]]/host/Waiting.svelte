<script>
	import * as m from '$lib/paraglide/messages.js';
	import { PUBLIC_DISPLAY_PLAY_URL, PUBLIC_PLAY_URL } from '$env/static/public';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Fullscreen from '$lib/layout/Fullscreen.svelte';
	import bee3 from '$lib/assets/bee3.mp3';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Audio from '$lib/media/Audio.svelte';
	import PlayersList from '$lib/game/PlayersList.svelte';
	import VolumeUpOutline from '~icons/material-symbols/volume-up-outline';
	import VolumeOffOutline from '~icons/material-symbols/volume-off-outline';
	import LockOpenRightOutline from '~icons/material-symbols/lock-open-right-outline';
	import LockOutline from '~icons/material-symbols/lock-outline';
	import QrCode from '$lib/game/QRCode.svelte';
	import { onMount } from 'svelte';
	import StatedIconButton from '$lib/ui/StatedIconButton.svelte';
	import PersonOutline from '~icons/material-symbols/person-outline';
	import ExitFuiz from './ExitFuiz.svelte';
	import tippy from 'tippy.js';
	import { localizeHref } from '$lib/paraglide/runtime';

	/** @type {{
	 * code: string;
	 * players: string[];
	 * exact_count: number;
	 * bindableGameInfo: import('./+page').BindableGameInfo;
	 * onnext?: () => void;
	 * onlock?: (locked: boolean) => void;
	}}*/
	let { code, players, exact_count, bindableGameInfo = $bindable(), onnext, onlock } = $props();

	let actualUrl = $derived(PUBLIC_PLAY_URL + localizeHref('/play?code=' + code));

	function copy_url_to_clipboard() {
		navigator.clipboard.writeText(actualUrl);
	}

	/** @type {HTMLElement | undefined} */
	let fullscreenElement = $state();

	/** @type {HTMLButtonElement | undefined} */
	let copyUrlButton = $state();

	onMount(() => {
		if (!copyUrlButton) return;
		tippy(copyUrlButton, {
			content: m.copy_clipboard(),
			arrow: false,
			theme: 'fuiz'
		});
		tippy(copyUrlButton, {
			trigger: 'click',
			content: m.copied(),
			arrow: false,
			theme: 'fuiz'
		});
	});
</script>

<Audio audioUrl={bee3} volumeOn={bindableGameInfo.volumeOn} />
<div id="container" bind:this={fullscreenElement} style:height="100%" style:display="flex">
	<div
		id="info"
		style:background="var(--background-color)"
		style:box-shadow="0 2px 2px #00000040, 2px 0 2px #00000040"
		style:display="flex"
		style:align-items="start"
		style:gap="1em"
		style:padding="0.6em 0.4em"
		style:justify-content="space-between"
	>
		<div>
			<ExitFuiz />
			<div style:padding="0.4em">
				<div>{m.join_at()}</div>
				<div style:font-weight="bold">
					{PUBLIC_DISPLAY_PLAY_URL}{localizeHref('/play')}
				</div>
			</div>
		</div>
		<div
			style:background="color-mix(in srgb, currentColor 20%, transparent)"
			style:display="flex"
			style:align-items="center"
			style:padding="0.4em"
			style:gap="0.4em"
			style:border-radius="0.4em"
		>
			<button
				onclick={copy_url_to_clipboard}
				bind:this={copyUrlButton}
				style:font="inherit"
				style:color="inherit"
				style:appearance="none"
				style:border="none"
				style:background="none"
				style:cursor="pointer"
				style:text-align="start"
				style:font-family="Poppins"
			>
				<div style:font-size="1em">{m.game_code()}</div>
				<div style:font-size="3em" style:line-height="1em" style:text-transform="uppercase">
					{code}
				</div>
			</button>
			<QrCode url={actualUrl} smallSize="9em" />
		</div>
		<div
			style:display="flex"
			style:justify-content="center"
			style:width="fit-content"
			style:font-size="1.5em"
		>
			<FancyButton onclick={onnext}>
				<div style:padding="0 1em" style:font-family="Poppins">{m.start()}</div>
			</FancyButton>
		</div>
	</div>
	<div style:flex="1">
		<NiceBackground>
			<div
				style:height="100%"
				style:display="flex"
				style:flex-direction="column"
				style:gap="0.2em"
				style:padding="0.2em"
				style:box-sizing="border-box"
			>
				<div style:display="flex" style:gap="0.2em" style:align-items="center">
					<div style:flex="1" style:display="flex" style:align-items="center">
						<PersonOutline height="1em" title={m.number_of_players()} />
						{exact_count}
					</div>
					<StatedIconButton
						icons={[
							{ component: LockOpenRightOutline, alt: m.lock_game() },
							{ component: LockOutline, alt: m.unlock_game() }
						]}
						size="1em"
						bind:state={bindableGameInfo.locked}
						onchange={onlock}
					/>
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
				<div
					style:min-height="40vh"
					style:margin="auto"
					style:display="flex"
					style:align-items="center"
					style:justify-content="center"
				>
					<div
						id="players"
						style:display="flex"
						style:justify-content="center"
						style:align-items="center"
						style:flex-wrap="wrap"
						style:max-width="40ch"
						style:gap="0.2em"
						style:padding="0.2em"
						style:overflow="auto"
					>
						<PlayersList players={players.map((n) => [n, false])} exactCount={exact_count} />
					</div>
				</div>
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	#players {
		font-size: 1.5em;
	}

	#container {
		flex-direction: column;
	}

	#info {
		flex-wrap: wrap;
	}

	@media (max-width: 700px) {
		#players {
			font-size: 0.8em;
		}

		#info {
			flex-direction: column;
		}
	}
</style>
