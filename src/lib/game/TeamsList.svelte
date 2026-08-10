<script lang="ts">
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import type { TeamRoster } from '$lib/question-types/host/types';

	let {
		teams,
		dense = undefined
	}: {
		teams: TeamRoster[];
		/** Force the tighter layout; otherwise it kicks in once teams outgrow a row. */
		dense?: boolean;
	} = $props();

	// A handful of teams get room to breathe; a classroom's worth has to fit.
	const compact = $derived(dense ?? teams.length > 4);
</script>

<div class="teams" class:compact>
	{#each teams as team (team.name)}
		<div class="team" transition:scale={{ duration: 300, easing: backOut }}>
			<div class="name">{team.name}</div>
			{#if team.members.length > 0}
				<div class="members">
					{#each team.members as member (member.name)}
						<span class="member" class:offline={!member.connected}>{member.name}</span>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.teams {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14em, 1fr));
		gap: 0.8em;
		width: 100%;
		align-content: center;
	}

	.teams.compact {
		grid-template-columns: repeat(auto-fit, minmax(11em, 1fr));
		gap: 0.5em;
	}

	/* Grouping only: a tint rather than an outline, so the members stay the
	   thing you look at, the way they are on the lobby screen. */
	.team {
		background: color-mix(in srgb, var(--surface-variant) 35%, transparent);
		border-radius: 0.8em;
		padding: 0.5em 0.6em;
	}

	.name {
		font-weight: bold;
		margin-bottom: 0.3em;
	}

	.compact .name {
		font-size: 0.9em;
	}

	.members {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3em;
	}

	/* Same pill as a player on the lobby screen: filled, unbordered, bold. */
	.member {
		background: var(--surface-variant);
		padding: 0.3em 0.6em;
		border-radius: 0.6em;
		font-weight: bold;
		font-size: 0.8em;
		word-break: break-word;
	}

	.compact .member {
		font-size: 0.7em;
	}

	/* Struck through rather than only faded, so a missing player reads as absent
	   on a projector and without relying on colour. */
	.member.offline {
		opacity: 0.5;
		text-decoration: line-through;
	}
</style>
