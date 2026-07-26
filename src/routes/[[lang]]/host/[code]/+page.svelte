<script lang="ts">
	import { page } from '$app/state';
	import Host from '../Host.svelte';

	let code = $derived(page.params.code ?? '');
</script>

<Host {code} />
