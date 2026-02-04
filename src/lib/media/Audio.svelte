<script>
	/** @type {{ audioUrl: string; volumeOn: boolean }} */
	let { audioUrl, volumeOn } = $props();
</script>

<audio autoplay loop src={audioUrl} volume={volumeOn ? 1 : 0}></audio>

<style>
	audio {
		display: none;
	}
</style>
