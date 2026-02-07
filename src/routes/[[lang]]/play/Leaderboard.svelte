<script>
	import * as m from '$lib/paraglide/messages.js';

	import { medalColors } from '$lib';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';
	import medal from '$lib/assets/icons/medal.svg';
	import Icon from '$lib/media/Icon.svelte';

	/** @type {{name: string;score: number;position: number | undefined;final: boolean;}} */
	let { name, score, position, final } = $props();
</script>

<div style:height="100%" style:display="flex" style:flex-direction="column">
	<Topbar {name} {score} />
	<div style:flex="1">
		<NiceBackground>
			<div
				style:height="100%"
				style:display="flex"
				style:justify-content="center"
				style:align-items="center"
			>
				<div
					style:display="flex"
					style:gap="10px"
					style:flex-direction="column"
					style:align-items="center"
				>
					{#if position !== undefined}
						{#if position < 3}
							<div
								style:height="100%"
								style:width="100%"
								style:display="flex"
								style:flex-direction="column"
								style:align-items="center"
								style:justify-content="center"
								style:background="var(--palette-dark)"
								style:border="0.15em solid"
								style:border-radius="0.7em"
								style:padding="0.5em"
								style:font-family="Poppins"
								style:box-sizing="border-box"
							>
								<div style:color={medalColors[position]}>
									<Icon size="200px" src={medal} alt="medal" />
								</div>
								<div style:color={medalColors[position]}>
									{#if position === 0}
										{m.first()}
									{:else if position === 1}
										{m.second()}
									{:else}
										{m.third()}
									{/if}
								</div>
							</div>
							{#if final}
								{m.great_job()}
							{:else}
								{m.keep_it_up()}
							{/if}
						{:else}
							<div
								style:display="flex"
								style:flex-direction="column"
								style:align-items="center"
								style:font-size="3em"
							>
								#{position + 1}
							</div>
							{#if final}
								{m.not_bad()}
							{:else}
								{m.catch_up()}
							{/if}
						{/if}
					{:else}
						{m.not_there()}
					{/if}
				</div>
			</div>
		</NiceBackground>
	</div>
</div>
