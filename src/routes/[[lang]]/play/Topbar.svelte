<script>
	import SportsScore from '~icons/material-symbols/sports-score';

	/** @type {{name: string;score?: number | undefined;}} */
	let { name, score = undefined } = $props();
</script>

<div
	style:display="flex"
	style:border-bottom="0.15em solid"
	style:background="var(--background-color)"
	style:padding="0.2em 0.4em"
	style:align-items="center"
	style:box-sizing="border-box"
>
	<div
		style:display="flex"
		style:padding="0.2em"
		style:font-family="Poppins"
		style:overflow-wrap="anywhere"
		style:box-sizing="border-box"
	>
		{name}
	</div>
	{#if score}
		<div
			style:margin-left="auto"
			style:font-weight="bold"
			style:display="flex"
			style:gap="3px"
			style:padding="0.2em"
			style:box-sizing="border-box"
			style:align-items="center"
		>
			<div style:font-family="Poppins">
				{score}
			</div>
			<SportsScore height="1.25em" />
		</div>
	{/if}
</div>
