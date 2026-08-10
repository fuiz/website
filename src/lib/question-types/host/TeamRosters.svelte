<script lang="ts">
	import { getContext } from 'svelte';
	import Modal from '$lib/feedback/Modal.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { HOST_TEAM_ROSTERS, type HostTeamRosters } from './types';

	const teamRosters = getContext<HostTeamRosters | undefined>(HOST_TEAM_ROSTERS);

	let modal = $state<Modal>();
	let refresh: ReturnType<typeof setInterval> | undefined;

	/** How often an open list re-asks the server. */
	const REFRESH_MS = 4000;

	export function open() {
		teamRosters?.request();
		// Kept fresh while it is open. Whether a member is still connected is the
		// one thing here with no event behind it — a player dropping mid-game
		// tells the host nothing — so a single snapshot would go stale under the
		// host as they read it.
		refresh = setInterval(() => teamRosters?.request(), REFRESH_MS);
		modal?.open();
	}

	function onclose() {
		clearInterval(refresh);
		refresh = undefined;
	}

	let teams = $derived(teamRosters?.list);
</script>

<Modal bind:this={modal} width="min(52ch, calc(100vw - 2em))" {onclose}>
	<h2 class="modal-title">{m.team_rosters()}</h2>
	{#if !teams}
		<div class="empty">{m.loading_teams()}</div>
	{:else if teams.length === 0}
		<div class="empty">{m.no_teams()}</div>
	{:else}
		<div class="teams-list">
			{#each teams as team (team.name)}
				{@const online = team.members.filter((member) => member.connected).length}
				<section class="team">
					<div class="team-header">
						<h3 class="team-name">{team.name}</h3>
						<span class="team-count" class:short={online < team.members.length}>
							{m.team_connected_count({ online, total: team.members.length })}
						</span>
					</div>
					<div class="members">
						{#each team.members as member (member.name)}
							<span
								class="member"
								class:offline={!member.connected}
								title={member.connected ? m.member_online() : m.member_offline()}
							>
								{member.name}
							</span>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}
</Modal>

<style>
	.modal-title {
		font-family: var(--alternative-font);
		margin: 0 0 0.7em;
		font-size: 1.25em;
	}

	.empty {
		opacity: 0.7;
		padding: 0.5em 0;
	}

	.teams-list {
		display: flex;
		flex-direction: column;
		gap: 0.9em;
		max-height: min(60vh, 30em);
		overflow-y: auto;
	}

	.team-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.8em;
	}

	.team-name {
		font-family: var(--alternative-font);
		font-size: 1em;
		margin: 0 0 0.3em;
	}

	.team-count {
		font-size: 0.85em;
		opacity: 0.7;
		white-space: nowrap;
	}

	/* The reason the list exists: a team playing a member short. */
	.team-count.short {
		color: var(--error, #b3261e);
		opacity: 1;
	}

	.members {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35em;
	}

	.member {
		padding: 0.2em 0.6em;
		border-radius: 0.4em;
		border: 1px solid var(--outline);
		font-family: var(--alternative-font);
	}

	/* Struck through rather than merely faded, so it reads as absent on a
	   projector and without relying on colour alone. */
	.member.offline {
		opacity: 0.55;
		text-decoration: line-through;
		border-style: dashed;
	}
</style>
