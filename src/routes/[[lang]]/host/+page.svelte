<script>
	import { page } from '$app/state';
	import Create from './Create.svelte';
	import Host from './Host.svelte';
	import Options from './Options.svelte';

	/**
	 * @param {string | null} str
	 * @returns {number | null}
	 */
	function parseIntOrNull(str) {
		if (str === null) {
			return null;
		}
		try {
			return Number.parseInt(str);
		} catch {
			return null;
		}
	}

	let code = $derived(page.url.searchParams.get('code'));
	let id = $derived(parseIntOrNull(page.url.searchParams.get('id')));
</script>

{#if code !== null}
	<Host {code} />
{:else if id !== null}
	<Options {id} />
{:else}
	<Create />
{/if}
