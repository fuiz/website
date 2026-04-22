<script lang="ts">
	import Waiting from '../host/Waiting.svelte';

	const players = [
		'FuzzyGlider',
		'ProudDolphin',
		'SuperOtter',
		'ArcticSeaLion',
		'FlyingSable',
		'BravePenguin',
		'SwiftFalcon',
		'CleverFox',
		'SilentOwl',
		'WildMustang',
		'LuckyRabbit',
		'IronBear',
	];

	let bindableGameInfo = $state({
		volumeOn: false,
		locked: false,
	});
</script>

<Waiting
	code="ABCDE"
	{players}
	exact_count={players.length}
	bind:bindableGameInfo
/>
