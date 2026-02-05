<script>
	import * as m from '$lib/paraglide/messages.js';

	import { limits } from '$lib';
	import Icon from '$lib/media/Icon.svelte';
	import SelectTime from '$lib/ui/SelectTime.svelte';

	/** @type {{activeSlide: import('$lib/types').OrderSlide;}} */
	let { activeSlide = $bindable() } = $props();
</script>

<div id="sidebar-container">
	<div id="sidebar">
		<div>
			<div class="field-title">{m.time_limit()}</div>
			<div>
				<SelectTime
					options={[...limits.fuiz.typeAnswer.allowedTimeLimits]}
					map={(v) => (parseInt(v) / 1000).toString()}
					bind:selected={activeSlide.time_limit}
				>
					<Icon src="$lib/assets/timer.svg" size="1em" alt={m.time_limit()} />
				</SelectTime>
			</div>
		</div>
		<div>
			<div class="field-title">{m.time_before_answers()}</div>
			<div>
				<SelectTime
					options={[...limits.fuiz.typeAnswer.allowedIntroduceQuestion]}
					map={(v) => (parseInt(v) / 1000).toString()}
					bind:selected={activeSlide.introduce_question}
				>
					<Icon src="$lib/assets/timer.svg" size="1em" alt="{m.time_before_answers}()}" />
				</SelectTime>
			</div>
		</div>
		<div>
			<div class="field-title">{m.points()}</div>
			<div>
				<SelectTime
					options={[...limits.fuiz.typeAnswer.allowedPointsAwarded]}
					map={(v) => {
						if (v === '0') {
							return m.none();
						} else if (v === '500') {
							return m.half();
						} else if (v === '1000') {
							return m.regular();
						} else if (v === '2000') {
							return m.double();
						}
						return v;
					}}
					bind:selected={activeSlide.points_awarded}
				>
					<Icon src="$lib/assets/score.svg" size="1em" alt={m.points()} />
				</SelectTime>
			</div>
		</div>
	</div>
</div>

<style>
	#sidebar {
		width: 8em;
		display: flex;
		flex-direction: column;
		border-inline-start: 0.05em solid #00000020;
		height: 100%;

		& > div {
			margin: 0.4em;
		}

		& .field-title {
			font-size: 0.6em;
			display: flex;
			justify-content: space-between;
		}
	}

	@media only screen and (max-width: 900px) {
		#sidebar {
			overflow: scroll;
			width: auto;
			flex-direction: row;
			border-block-end: 0.05em solid #00000020;
			border-inline-start: none;
		}

		#sidebar > div {
			min-width: max-content;
		}

		#sidebar-container {
			min-width: 100%;
			width: 0px;
		}

		.field-title {
			flex-direction: column;
			align-items: start;
		}
	}
</style>
