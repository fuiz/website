<script lang="ts">
	let { audioUrl, volumeOn }: { audioUrl: string; volumeOn: boolean } = $props();
</script>

<audio autoplay loop src={audioUrl} volume={volumeOn ? 1 : 0}></audio>

<style>
	audio {
		display: none;
	}
</style>
