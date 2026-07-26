<script lang="ts">
	import Loading from '$lib/feedback/Loading.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllReports, loadDatabase } from '$lib/storage';
	import ReportCard from '$lib/ui/ReportCard.svelte';
</script>

<svelte:head>
	<title>{m.reports()}</title>
	<meta property="og:title" content={m.reports()} />
</svelte:head>

{#await loadDatabase().then((db) => getAllReports(db))}
	<Loading />
{:then reports}
	<TypicalPage>
		<div class="wrapper">
			<h2>{m.reports()}</h2>
			{#if reports.length === 0}
				<div class="empty">
					<div class="empty-title">{m.no_reports_title()}</div>
					<div class="empty-detail">{m.no_reports_detail()}</div>
				</div>
			{:else}
				<ul class="list">
					{#each reports as [id, report] (id)}
						<li><ReportCard {id} {report} /></li>
					{/each}
				</ul>
			{/if}
		</div>
	</TypicalPage>
{/await}

<style>
	.wrapper {
		max-width: 90ch;
		margin: 1em auto;
		padding: 0 0.4em;
	}

	h2 {
		font-family: var(--alternative-font);
		line-height: 1;
		margin: 0 0 0.4em;
		opacity: 0.7;
	}

	.empty {
		border: 1px dashed var(--outline);
		border-radius: 0.7em;
		padding: 1.5em 1em;
		text-align: center;
	}

	.empty-title {
		font-weight: 700;
	}

	.empty-detail {
		font-size: 0.8em;
		opacity: 0.7;
		margin-top: 0.2em;
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22ch), 1fr));
		gap: 0.5em;
	}
</style>
