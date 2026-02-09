<script>
	import * as m from '$lib/paraglide/messages.js';

	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import correct_penguin from '$lib/assets/visuals/correct_penguin.svg';
	import wrong_penguin from '$lib/assets/visuals/wrong_penguin.svg';
	import Topbar from './Topbar.svelte';
	import { Confetti } from 'svelte-confetti';

	/** @type {{name: string;score: number;correct: boolean;}} */
	let { name, score, correct } = $props();
</script>

<div style:height="100%" style:display="flex" style:flex-direction="column">
	<Topbar {name} {score} />
	<div style:flex="1" id="confetti-container">
		<NiceBackground>
			<div
				style:height="100%"
				style:display="flex"
				style:justify-content="center"
				style:align-items="center"
			>
				<div style:display="flex" style:flex-direction="column" style:align-items="center">
					<img
						style:width="10em"
						src={correct ? correct_penguin : wrong_penguin}
						alt={correct ? m.penguin_checkmark() : m.penguin_crossmark()}
					/>
					<div style:font-weight="bold" style:max-width="10ch" style:text-align="center">
						{#if correct}
							{m.thats_correct()}
						{:else}
							{m.try_again()}
						{/if}
					</div>
				</div>
				{#if correct}
					<div
						style:position="fixed"
						style:top="0"
						style:left="0"
						style:height="100dvh"
						style:width="100vw"
						style:display="flex"
						style:justify-content="center"
						style:overflow="hidden"
						style:pointer-events="none"
						style:z-index="-1"
					>
						<Confetti
							x={[-5, 5]}
							y={[0, 0.1]}
							delay={[500, 2000]}
							infinite
							duration={5000}
							amount={200}
							size={30}
							fallDistance="100vh"
							disableForReducedMotion={true}
						/>
					</div>
				{/if}
			</div>
		</NiceBackground>
	</div>
</div>
