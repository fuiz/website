<script>
	import Answers from '$lib/game/Answers.svelte';
	import EmptyAnswers from '$lib/game/EmptyAnswers.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import MediaDisplay from '$lib/media/MediaDisplay.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';

	/** @type {{questionText: string;name: string;score: number;media: undefined | import('$lib/types').Media;showAnswers: boolean;answers: (import('$lib/types').TextOrMedia | undefined)[];onanswer?: (answer: number) => void;}} */
	let { questionText, name, score, media, showAnswers, answers, onanswer } = $props();
</script>

<div style:height="100%" style:display="flex" style:flex-direction="column">
	<div>
		<Topbar {name} {score} />
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	</div>
	<div style:flex="1">
		<NiceBackground>
			<div style:height="100%" style:display="flex" style:flex-direction="column">
				{#if media && showAnswers}
					<div style:height="40dvh">
						<MediaDisplay {media} fit="contain" />
					</div>
				{/if}
				{#if !showAnswers}
					<EmptyAnswers indices={[...new Array(answers.length).keys()]} {onanswer} />
				{:else}
					<div style:flex="1" style:font-size="1.5em">
						<Answers
							answers={answers.map((t) => ({ text: t?.Text, correct: undefined }))}
							{onanswer}
						/>
					</div>
				{/if}
			</div>
		</NiceBackground>
	</div>
</div>
