<script lang="ts">
	import Leaderboard from '../host/Leaderboard.svelte';

	const prior: [string, number][] = [
		['ProudDolphin', 4200],
		['FuzzyGlider', 4100],
		['SuperOtter', 3900],
		['ArcticSeaLion', 3800],
		['FlyingSable', 3700]
	];

	const current: [string, number][] = [
		['FuzzyGlider', 5176],
		['ProudDolphin', 4759],
		['SuperOtter', 4758],
		['ArcticSeaLion', 4674],
		['FlyingSable', 4566]
	];

	let bindableGameInfo = $state({
		volumeOn: false,
		locked: false
	});
</script>

<Leaderboard
	bind:bindableGameInfo
	gameInfo={{
		gameCode: 'DEMO',
		questionIndex: 5,
		questionTotalCount: 13,
	}}
	final={true}
	prior={{ exact_count: 5, items: prior }}
	current={{ exact_count: 5, items: current }}
/>
