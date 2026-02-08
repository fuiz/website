<script>
	import * as m from '$lib/paraglide/messages.js';

	import { buttonColors, limits } from '$lib/clientOnly';
	import Checkbox from '$lib/ui/Checkbox.svelte';
	import DeleteOutline from '~icons/material-symbols/delete-outline';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Textbox from '$lib/ui/Textbox.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';

	/** @type {{correct: boolean;content: import('$lib/types').TextOrMedia;index: number;attention?: boolean;onclick?: () => void;}} */
	let {
		correct = $bindable(),
		content = $bindable(),
		index,
		attention = false,
		onclick
	} = $props();
</script>

<FancyButton
	backgroundColor={buttonColors.at(index % buttonColors.length)?.[0]}
	backgroundDeepColor={buttonColors.at(index % buttonColors.length)?.[1]}
	active={false}
>
	<div
		style:display="flex"
		style:align-items="center"
		style:padding="0.15em 0.3em"
		style:gap="0.3em"
		style:color="var(--palette-light)"
	>
		<div style:height="1.5em" style:display="flex">
			<Checkbox
				{attention}
				bind:value={correct}
				color={buttonColors.at(index % buttonColors.length)?.[0]}
			/>
		</div>
		<Textbox
			bind:value={content.Text}
			placeholder={m.answer_text()}
			textAlign="start"
			lightText
			maxLength={limits.fuiz.maxAnswerTextLength}
		/>
		<IconButton alt={m.delete_answer()} {onclick}><DeleteOutline height="1.25em" /></IconButton>
	</div>
</FancyButton>
