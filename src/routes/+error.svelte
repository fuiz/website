<script lang="ts">
	import { page } from '$app/state';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
</script>

<ErrorPage errorMessage="{page.status}: {page.error?.message ?? page.status.toString()}" />
