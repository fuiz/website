<script lang="ts">
	// The announcement glyph for Order: ranked bars. Sized in `em` so the parent
	// scene controls the scale.
	const rows = [
		{ palette: 0, rank: 1, width: '66%' },
		{ palette: 3, rank: 2, width: '48%' },
		{ palette: 1, rank: 3, width: '60%' }
	];
</script>

<div class="order">
	{#each rows as { palette, rank, width } (rank)}
		<div class="row palette-{palette}">
			<span class="rank">{rank}</span>
			<span class="line" style:--lw={width}></span>
		</div>
	{/each}
</div>

<style>
	.order {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		width: 8.4em;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.55em;
		width: 100%;
		height: 2em;
		padding: 0 0.5em;
		border-radius: 0.55em;
		background: var(--btn-bg);
		box-shadow: 0 0.26em 0 var(--btn-deep);
		color: #ffffff;
		box-sizing: border-box;
	}

	.rank {
		flex: none;
		display: grid;
		place-items: center;
		width: 1.4em;
		height: 1.4em;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.9);
		color: var(--btn-deep);
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 0.85em;
	}

	.line {
		width: var(--lw);
		height: 0.34em;
		border-radius: 1em;
		background: rgba(255, 255, 255, 0.6);
	}
</style>
