<script lang="ts">
	import { getContext } from 'svelte';
	import Modal from '$lib/feedback/Modal.svelte';
	import Fullscreen from '$lib/layout/Fullscreen.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import DarkModeSwitcher from '$lib/ui/DarkModeSwitcher.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import StatedIconButton from '$lib/ui/StatedIconButton.svelte';
	import Groups3Outline from '~icons/material-symbols/groups-3-outline';
	import GroupsOutline from '~icons/material-symbols/groups-outline';
	import LockOpenRightOutline from '~icons/material-symbols/lock-open-right-outline';
	import LockOutline from '~icons/material-symbols/lock-outline';
	import SkipNext from '~icons/material-symbols/skip-next';
	import VolumeOffOutline from '~icons/material-symbols/volume-off-outline';
	import VolumeUpOutline from '~icons/material-symbols/volume-up-outline';
	import ExitFuiz from './ExitFuiz.svelte';
	import TeamRosters from './TeamRosters.svelte';
	import {
		type BindableGameInfo,
		HOST_RESPONSES,
		HOST_TEAM_ROSTERS,
		type HostResponses,
		type HostTeamRosters,
		type ResponseSummary,
		type SharedGameInfo
	} from './types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		fullscreenElement = undefined,
		onnext,
		onlock,
		responses = undefined,
		extraControls
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		fullscreenElement?: HTMLElement;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
		/** How many have answered, kept out of the slide itself so the question
		 *  and its results own the screen. */
		responses?: ResponseSummary;
		extraControls?: import('svelte').Snippet;
	} = $props();

	let responsesModal = $state<Modal>();
	let teamRostersModal = $state<TeamRosters>();

	// Absent outside a live game, and false in a game without teams. Any screen
	// with a topbar is past team formation, so `enabled` is the whole check.
	const teamRosters = getContext<HostTeamRosters | undefined>(HOST_TEAM_ROSTERS);

	// Absent outside a live game (the component gallery), where the aggregate is
	// all there is.
	const hostResponses = getContext<HostResponses | undefined>(HOST_RESPONSES);

	/** Every player's own answer, once the server has replied. */
	let players = $derived(hostResponses?.list);

	// Only a live game can name who answered. Everywhere else the count is worth
	// showing but there is nothing to open, and opening it on the aggregate
	// would only repeat the chart already on the slide behind it.
	let openable = $derived(hostResponses !== undefined);

	function openResponses() {
		// Asked for on open, so the largest payload of the game only crosses the
		// wire when someone actually wants to read it.
		hostResponses?.request();
		responsesModal?.open();
	}
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
		{#if responses}
			{#if openable}
				<button class="responses" onclick={openResponses} title={m.answered_count()}>
					<GroupsOutline height="1em" />
					<span>{responses.count}</span>
				</button>
			{:else}
				<div class="responses static" title={m.answered_count()}>
					<GroupsOutline height="1em" />
					<span>{responses.count}</span>
				</div>
			{/if}
		{/if}
		{#if teamRosters?.enabled}
			<IconButton alt={m.view_teams()} onclick={() => teamRostersModal?.open()}>
				<Groups3Outline />
			</IconButton>
		{/if}
		<IconButton alt={m.skip()} onclick={onnext} disabled={gameInfo.nextDisabled}><SkipNext/></IconButton>
		{#if extraControls}
			{@render extraControls()}
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

<TeamRosters bind:this={teamRostersModal} />

<Modal bind:this={responsesModal} width="min(46ch, calc(100vw - 2em))">
	<h2 class="modal-title">{m.responses()}</h2>
	{#if !players}
		<div class="empty">{m.loading_responses()}</div>
	{:else if players.length === 0}
		<div class="empty">{m.no_responses()}</div>
	{:else}
		<!-- What each player actually said. -->
		<div class="responses-list">
			{#each players as player, index (index)}
				<div class="player-row">
					<span class="player-name">{player.name}</span>
					<span class="player-answer">{player.answer}</span>
				</div>
			{/each}
		</div>
	{/if}
</Modal>

<style>
	.topbar {
		display: flex;
		background: var(--surface);
		box-shadow: 0 2px 2px #00000040;
		padding: 0.2em;
		line-height: 1em;
		align-items: center;
		gap: 10px;
		row-gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
		position: relative;
		z-index: 1;
	}

	.slide-index {
		display: flex;
		padding: 0.3em 0.4em;
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

	/* Sits with the controls rather than in the slide: the count matters to the
	   host, not to the room reading the question. */
	.responses {
		appearance: none;
		font: inherit;
		font-family: var(--alternative-font);
		font-weight: 800;
		display: inline-flex;
		align-items: center;
		gap: 0.25em;
		padding: 0.25em 0.5em;
		border-radius: 0.4em;
		border: 1px solid var(--outline);
		background: var(--surface);
		color: inherit;
		white-space: nowrap;
	}

	button.responses {
		cursor: pointer;
	}

	button.responses:where(:hover, :focus-visible) {
		border-color: var(--primary);
		color: var(--primary);
		outline: none;
	}

	.modal-title {
		font-family: var(--alternative-font);
		margin: 0 0 0.7em;
		font-size: 1.25em;
	}

	.responses-list {
		display: flex;
		flex-direction: column;
		gap: 0.35em;
		max-height: min(60vh, 30em);
		overflow-y: auto;
	}





	.player-row {
		display: grid;
		grid-template-columns: minmax(6em, 12em) minmax(0, 1fr);
		gap: 0.8em;
		align-items: baseline;
		padding: 0.15em 0;
		border-bottom: 1px solid color-mix(in srgb, var(--on-surface) 10%, transparent);
	}

	.player-name {
		font-family: var(--alternative-font);
		font-weight: 800;
		overflow-wrap: anywhere;
	}

	.player-answer {
		overflow-wrap: anywhere;
	}

	.empty {
		opacity: 0.65;
		padding: 0.6em 0;
		text-align: center;
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
