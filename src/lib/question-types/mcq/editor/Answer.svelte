<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import type { TextOrMedia } from '$lib/types';
	import Checkbox from '$lib/ui/Checkbox.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textbox from '$lib/ui/Textbox.svelte';
	import DeleteOutline from '~icons/material-symbols/delete-outline';

	let {
		correct = $bindable(),
		content = $bindable(),
		index,
		attention = false,
		onclick
	}: {
		correct: boolean;
		content: TextOrMedia;
		index: number;
		attention?: boolean;
		onclick?: () => void;
	} = $props();
</script>

<FancyButton palette={index} active={false}>
	<div class="row">
		<div class="check-cell">
			<Checkbox {attention} bind:value={correct} />
		</div>
		<Textbox
			bind:value={content.Text}
			placeholder={m.answer_text()}
			textAlign="start"
			lightText
			maxLength={limits.fuiz.maxAnswerTextLength}
		/>
		<IconButton alt={m.delete_answer()} {onclick}>
			<DeleteOutline height="1.25em" />
		</IconButton>
	</div>
</FancyButton>

<style>
	.row {
		display: flex;
		align-items: center;
		padding: 0.15em 0.3em;
		gap: 0.3em;
		color: var(--palette-light);
	}

	.check-cell {
		height: 1.5em;
		display: flex;
	}
</style>
